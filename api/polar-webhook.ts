import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LicenseStatus } from '../services/licenseService';
import { getXataClient } from '../services/xataService';
import crypto from 'crypto';
import { Buffer } from 'buffer';

const xata = getXataClient();

export const config = {
    api: {
        bodyParser: false,
    },
};

const PRODUCT_ID_TO_PLAN: Record<string, { plan: LicenseStatus['plan'], credits: number }> = {
    'polar_cl_dxRr7iGKWfMzpHYZlFGd5tY18ICJM30sDgGf80Y0dCj': { plan: 'Booster', credits: 5000 },
    'polar_cl_lTBWXKtStKOn44M16Qpb2LdlE1YC7OaxWNDDo4RTpge': { plan: 'Premium', credits: 15000 },
    'polar_cl_SrTKX1rcDoCW5jAoj4lZsmqnwNoocvi8oGZLu4WmoMa': { plan: 'Professional', credits: 30000 },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const rawBody = await getRawBody(req);
        const signature = req.headers['polar-signature'] as string;
        const secret = process.env.POLAR_WEBHOOK_SECRET;

        if (!secret) {
            console.error('POLAR_WEBHOOK_SECRET is not set in environment variables.');
            return res.status(500).json({ error: 'Webhook secret not configured.' });
        }
        if (!signature) {
            return res.status(401).json({ error: 'Signature missing from request.' });
        }

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'hex');
        const receivedSignature = Buffer.from(signature, 'hex');

        if (!crypto.timingSafeEqual(digest, receivedSignature)) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }

        const event = JSON.parse(rawBody.toString());

        if (event.type !== 'order.succeeded' || !event.data?.id || !event.data?.customer?.email || !event.data?.product?.id) {
            console.warn('Received invalid or non-order.succeeded webhook payload:', event);
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        const orderId = event.data.id;
        const customerEmail = event.data.customer.email.toLowerCase();
        const customerName = event.data.customer.name || 'Valued Customer';
        const productId = event.data.product.id;
        
        const planDetails = PRODUCT_ID_TO_PLAN[productId as keyof typeof PRODUCT_ID_TO_PLAN];

        if (!planDetails) {
            console.warn(`Webhook received for unknown product ID: ${productId}`);
            return res.status(200).json({ message: 'Order for unknown product processed, no action taken.' });
        }
        
        const orderProcessedKey = `order:${orderId}`;
        if (await kv.get(orderProcessedKey)) {
            return res.status(200).json({ message: 'Webhook already processed' });
        }
        
        let userRecord = await xata.db.users.filter({ email: customerEmail }).getFirst();

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        if (userRecord) {
            const newCredits = (userRecord.credits || 0) + planDetails.credits;
            await userRecord.update({
                name: userRecord.name || customerName, // Update name if it wasn't set
                plan: planDetails.plan,
                credits: newCredits,
                subscriptionStatus: 'active',
                planExpiryDate: expiryDate,
            });
        } else {
            // If user doesn't exist, create them with the purchased plan
            await xata.db.users.create({
                email: customerEmail,
                name: customerName,
                plan: planDetails.plan,
                credits: planDetails.credits,
                subscriptionStatus: 'active',
                planExpiryDate: expiryDate,
            });
        }
        
        await kv.set(orderProcessedKey, true, { ex: 86400 * 90 }); // Mark as processed

        console.log(`Successfully processed order ${orderId} for ${customerEmail}. Plan: ${planDetails.plan}, Credits Added: ${planDetails.credits}`);
        
        return res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Error processing Polar webhook:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}