// api/polar-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, ActivatedLicense, createGuestStatus, PlanName } from '../../services/licenseService';
import { PLANS } from '../../config/plans';
import * as crypto from 'crypto';
// FIX: Import Buffer to resolve 'Buffer' not found errors.
import { Buffer } from 'buffer';

// Helper function to read the raw body from the request.
// Vercel's default body parser needs to be disabled for this to work.
async function buffer(readable: VercelRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Disable Vercel's default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const rawBody = await buffer(req);
    const bodyString = rawBody.toString('utf8');
    const payload = JSON.parse(bodyString);

    // --- 1. Verify Webhook Signature for Security ---
    const secret = process.env.POLAR_WEBHOOK_SECRET;
    const signature = req.headers['polar-signature-256'] as string;

    if (!secret || !signature) {
      console.warn('Webhook secret or signature is missing.');
      return res.status(400).send('Webhook secret or signature is missing.');
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(bodyString);
    const expectedSignature = hmac.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('Invalid webhook signature.');
      return res.status(403).send('Invalid signature.');
    }

    // --- 2. Process the 'order.paid' Event ---
    if (payload.type === 'order.paid') {
      const orderData = payload.data;
      const customerEmail = orderData.customer_email;
      const productId = orderData.product_id;
      const orderId = orderData.id;

      if (!customerEmail || !productId) {
        return res.status(400).json({ message: 'Missing customer email or product ID in payload.' });
      }

      const planDetails = PLANS.find(p => p.id === productId);
      if (!planDetails) {
        console.warn(`Webhook received for unknown product ID: ${productId}`);
        // Still return 200 OK to Polar, but log the issue.
        return res.status(200).json({ message: 'Webhook processed, but product ID not found.' });
      }

      // --- 3. Find User and Update Credits in Firestore ---
      const usersRef = db.collection('users');
      const userQuery = await usersRef.where('email', '==', customerEmail).limit(1).get();
      
      let userRef;
      let userData: UserStatus;

      if (userQuery.empty) {
        // User purchased before visiting the site. Create a new user record.
        const guestStatus = createGuestStatus();
        userData = {
          ...guestStatus,
          name: customerEmail.split('@')[0],
          email: customerEmail,
          credits: 0, // Start with 0 before adding purchased credits
          isGuest: false,
        };
        userRef = usersRef.doc(); // Create a new document reference
        await userRef.set(userData);
      } else {
        userRef = userQuery.docs[0].ref;
        userData = userQuery.docs[0].data() as UserStatus;
      }

      const newLicense: ActivatedLicense = {
        key: `polar_order_${orderId}`, // Use order ID for uniqueness
        email: customerEmail,
        planName: planDetails.name as PlanName,
        creditsAdded: planDetails.credits,
        activationDate: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Update user's credits and license history
      const newCredits = (userData.credits || 0) + planDetails.credits;
      const newLicenses = [...(userData.licenses || []), newLicense];

      await userRef.update({
        credits: newCredits,
        licenses: newLicenses,
        plan: planDetails.name, // Update to the latest purchased plan
      });

      console.log(`Successfully added ${planDetails.credits} credits to ${customerEmail}.`);
    }

    // Acknowledge receipt to Polar.sh
    res.status(200).json({ message: 'Webhook received and processed successfully.' });

  } catch (error) {
    console.error('Error in Polar webhook handler:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred.';
    res.status(500).json({ message });
  }
}