// api/cron/trigger-bundle-generation.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';

const BUNDLE_COUNT = 20;

async function archivePolarProduct(productId: string) {
    const polarApiKey = process.env.POLAR_API_KEY;
    if (!polarApiKey) {
        console.warn(`POLAR_API_KEY not set. Cannot archive product ${productId}`);
        return;
    }
    try {
        await fetch(`https://api.polar.sh/v1/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${polarApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_archived: true }),
        });
        console.log(`Archived Polar product: ${productId}`);
    } catch (error) {
        console.error(`Failed to archive Polar product ${productId}:`, error);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Authorization Check
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // 2. Clear Old Bundles
        const bundlesRef = db.collection('pollinations_bundles');
        const snapshot = await bundlesRef.get();

        if (!snapshot.empty) {
            console.log(`Found ${snapshot.docs.length} old bundles to clear.`);
            const archivePromises = snapshot.docs.map(doc => archivePolarProduct(doc.data().polarProductId));
            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());

            await Promise.all(archivePromises);
            await Promise.all(deletePromises);
            console.log('Successfully cleared old bundles.');
        }

        // 3. Trigger New Bundle Generation (Fire-and-Forget)
        const triggerUrl = `${process.env.VERCEL_URL}/api/internal/generate-bundle`;
        
        for (let i = 0; i < BUNDLE_COUNT; i++) {
            // We don't await this fetch call. We want to trigger them all in parallel.
            fetch(triggerUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CRON_SECRET}`, // Internal secret
                },
            }).catch(e => console.error(`Error triggering bundle generation ${i + 1}:`, e));
        }

        console.log(`Triggered ${BUNDLE_COUNT} bundle generations.`);
        res.status(202).json({ message: `Triggered generation for ${BUNDLE_COUNT} bundles.` });

    } catch (error) {
        console.error('Cron trigger job error:', error);
        res.status(500).json({ message: 'An error occurred during the cron trigger execution.' });
    }
}