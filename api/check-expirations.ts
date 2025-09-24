import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Secure the cron job endpoint
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        console.log("Cron job started: Checking for expired subscriptions...");

        const now = new Date();
        
        // Find users whose subscription is 'active' but their expiry date is in the past
        const expiredUsers = await xata.db.users
            .filter({
                subscriptionStatus: 'active',
                planExpiryDate: { $lt: now }
            })
            .getAll();
        
        if (expiredUsers.length === 0) {
            console.log("Cron job finished: No expired users found.");
            return res.status(200).json({ message: 'No expired users found.' });
        }

        console.log(`Found ${expiredUsers.length} users with expired plans. Updating status...`);

        // Prepare bulk update operations
        const updates = expiredUsers.map(user => ({
            id: user.id,
            subscriptionStatus: 'expired'
        }));

        // Perform a bulk update for efficiency
        await xata.db.users.update(updates);

        console.log(`Cron job finished: Successfully updated ${expiredUsers.length} users to 'expired' status.`);
        
        return res.status(200).json({
            message: `Successfully updated ${expiredUsers.length} users to 'expired' status.`,
            updatedUserIds: expiredUsers.map(u => u.id)
        });

    } catch (error) {
        console.error('Error in check-expirations cron job:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return res.status(500).json({ message: 'Internal Server Error', error: message });
    }
}