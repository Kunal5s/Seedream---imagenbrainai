// api/marketplace/create-checkout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { bundleIds } = req.body;
    if (!Array.isArray(bundleIds) || bundleIds.length === 0) {
        return res.status(400).json({ message: 'Bundle IDs must be a non-empty array.' });
    }

    try {
        const bundlesRef = db.collection('pollinations_bundles');
        const bundlesSnapshot = await bundlesRef.where(db.FieldPath.documentId(), 'in', bundleIds).get();
        
        if (bundlesSnapshot.empty) {
            return res.status(404).json({ message: 'No valid bundles found for the given IDs.' });
        }

        let totalPrice = 0;
        const lineItems: any[] = [];
        bundlesSnapshot.forEach(doc => {
            const bundle = doc.data();
            totalPrice += bundle.price;
            lineItems.push({
                name: bundle.title,
                price: bundle.price,
                quantity: 1,
            });
        });
        
        const polarApiKey = process.env.POLAR_API_KEY;
        if (!polarApiKey) {
            throw new Error("POLAR_API_KEY is not configured.");
        }

        const successUrl = new URL('/#/purchase-success', process.env.VERCEL_URL).href;
        const cancelUrl = new URL('/#/purchase-cancelled', process.env.VERCEL_URL).href;

        const checkoutResponse = await fetch('https://api.polar.sh/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${polarApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                line_items: lineItems,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    type: 'bundle_purchase',
                    bundle_ids: bundleIds.join(','), // Pass bundle IDs for the webhook
                }
            }),
        });

        if (!checkoutResponse.ok) {
            const errorBody = await checkoutResponse.text();
            throw new Error(`Polar API Error: ${checkoutResponse.statusText} - ${errorBody}`);
        }

        const checkoutSession = await checkoutResponse.json();
        
        res.status(200).json({ checkoutUrl: checkoutSession.url });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create checkout session.' });
    }
}