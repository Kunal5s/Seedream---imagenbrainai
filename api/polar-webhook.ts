import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvService } from '../services/kvService';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import { PLAN_DETAILS } from '../config/plans';

export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const rawBody = await getRawBody(req);
        const signature = req.headers['polar-signature'] as string;
        const secret = process.env.POLAR_WEBHOOK_SECRET;

        if (!secret || !signature) return res.status(401).json({ error: 'Signature or secret missing.' });

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'hex');
        if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), digest)) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }

        const event = JSON.parse(rawBody.toString());
        if (event.type !== 'order.succeeded') return res.status(200).json({ message: 'Event is not order.succeeded.'});

        const { id: orderId, customer, product } = event.data;
        if (!orderId || !customer?.email || !product?.id) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        const planDetails = PLAN_DETAILS[product.id as keyof typeof PLAN_DETAILS];
        if (!planDetails) return res.status(200).json({ message: 'Unknown product ID.' });

        if (await kvService.isOrderProcessed(orderId)) {
            return res.status(200).json({ message: 'Webhook already processed' });
        }

        const customerEmail = customer.email.toLowerCase();
        let user = await kvService.getUserByEmail(customerEmail);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        if (user) {
            const newCredits = (user.credits || 0) + planDetails.credits;
            await kvService.updateUser(customerEmail, {
                name: user.name || customer.name || 'Valued Customer',
                plan: planDetails.planName,
                credits: newCredits,
                subscriptionStatus: 'active',
                planExpiryDate: expiryDate.toISOString(),
            });
        } else {
            await kvService.createUser({
                email: customerEmail,
                name: customer.name || 'Valued Customer',
                plan: planDetails.planName,
                credits: planDetails.credits,
                subscriptionStatus: 'active',
                planExpiryDate: expiryDate.toISOString(),
            });
        }
        
        await kvService.addActiveSubscriber(customerEmail);
        await kvService.markOrderAsProcessed(orderId);

        console.log(`Processed order ${orderId} for ${customerEmail}. Plan: ${planDetails.planName}`);
        return res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Error processing Polar webhook:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}