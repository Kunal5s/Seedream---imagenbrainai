// api/polar-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, ActivatedLicense, createGuestStatus, PlanName } from '../../services/licenseService';
import { PLANS } from '../../config/plans';
import * as crypto from 'crypto';
import { Buffer } from 'buffer';
import JSZip from 'jszip';
import { uploadImageToR2 } from '../../services/r2'; // Re-purposing for ZIP upload
import { v4 as uuidv4 } from 'uuid';

// Helper function to read the raw body from the request.
async function buffer(readable: VercelRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const createZipAndUpload = async (bundleIds: string[]): Promise<string> => {
    const zip = new JSZip();
    const bundlesRef = db.collection('pollinations_bundles');
    const imageFetchPromises: Promise<void>[] = [];
    
    for (const bundleId of bundleIds) {
        const doc = await bundlesRef.doc(bundleId).get();
        if (!doc.exists) {
            console.warn(`Bundle ID ${bundleId} not found during ZIP creation.`);
            continue;
        }
        const bundleData = doc.data();
        const bundleFolder = zip.folder(doc.data()?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || bundleId);

        bundleData?.imageUrls.forEach((url: string, index: number) => {
            const promise = fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {
                    bundleFolder?.file(`image_${index + 1}.png`, buffer);
                });
            imageFetchPromises.push(promise);
        });
    }

    await Promise.all(imageFetchPromises);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipBase64 = zipBuffer.toString('base64');
    
    // Use a modified version of uploadImageToR2 for zip files
    const bucketName = process.env.R2_BUCKET_NAME!;
    const publicUrlBase = process.env.R2_PUBLIC_URL!;
    const zipName = `purchases/${uuidv4()}.zip`;
    
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const R2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: zipName,
      Body: zipBuffer,
      ContentType: 'application/zip',
      ACL: 'public-read',
    });

    await R2.send(command);
    return `${publicUrlBase}/${zipName}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const rawBody = await buffer(req);
    const bodyString = rawBody.toString('utf8');
    const payload = JSON.parse(bodyString);
    const secret = process.env.POLAR_WEBHOOK_SECRET!;
    const signature = req.headers['polar-signature-256'] as string;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(bodyString);
    const expectedSignature = hmac.digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return res.status(403).send('Invalid signature.');
    }

    if (payload.type === 'order.paid') {
      const orderData = payload.data;
      const metadata = orderData.checkout_session.metadata || {};

      // --- Handle Bundle Purchase ---
      if (metadata.type === 'bundle_purchase' && metadata.bundle_ids) {
        const bundleIds = metadata.bundle_ids.split(',');
        const zipUrl = await createZipAndUpload(bundleIds);
        
        await db.collection('completed_orders').doc(orderData.id).set({
            orderId: orderData.id,
            customerEmail: orderData.customer_email,
            amount: orderData.amount,
            currency: orderData.currency,
            bundleIds: bundleIds,
            downloadUrl: zipUrl,
            createdAt: new Date().toISOString(),
        });

        console.log(`Processed bundle purchase for order ${orderData.id}. ZIP available at: ${zipUrl}`);

      // --- Handle Credit (License) Purchase ---
      } else {
        const customerEmail = orderData.customer_email;
        const productId = orderData.product_id;
        const planDetails = PLANS.find(p => p.id === productId);

        if (planDetails) {
            const usersRef = db.collection('users');
            const userQuery = await usersRef.where('email', '==', customerEmail).limit(1).get();
            let userRef, userData;

            if (userQuery.empty) {
                const guestStatus = createGuestStatus();
                userData = { ...guestStatus, name: customerEmail.split('@')[0], email: customerEmail, credits: 0, isGuest: false };
                userRef = usersRef.doc();
                await userRef.set(userData);
            } else {
                userRef = userQuery.docs[0].ref;
                userData = userQuery.docs[0].data() as UserStatus;
            }

            const newLicense: ActivatedLicense = {
                key: `polar_order_${orderData.id}`, email: customerEmail, planName: planDetails.name as PlanName,
                creditsAdded: planDetails.credits, activationDate: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };

            await userRef.update({
                credits: (userData.credits || 0) + planDetails.credits,
                licenses: [...(userData.licenses || []), newLicense],
                plan: planDetails.name,
            });
             console.log(`Successfully added ${planDetails.credits} credits to ${customerEmail}.`);
        }
      }
    }
    res.status(200).json({ message: 'Webhook processed successfully.' });

  } catch (error) {
    console.error('Error in Polar webhook handler:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}