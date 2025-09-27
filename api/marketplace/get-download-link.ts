// api/marketplace/get-download-link.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { orderId } = req.query;

    if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ message: 'Order ID is required.' });
    }

    try {
        const orderRef = db.collection('completed_orders').doc(orderId);
        const doc = await orderRef.get();

        if (!doc.exists) {
            // It might not exist yet if the webhook is slow, so return null instead of 404
            return res.status(200).json({ downloadUrl: null });
        }

        const data = doc.data();
        res.status(200).json({ downloadUrl: data?.downloadUrl || null });

    } catch (error) {
        console.error("Error fetching download link:", error);
        res.status(500).json({ message: 'Failed to fetch download link.' });
    }
}