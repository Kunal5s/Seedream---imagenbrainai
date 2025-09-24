import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvService } from '../services/kvService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const cronSecret = process.env.CRON_SECRET;
    if (req.headers.authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        console.log("Cron job started: Checking for expired subscriptions...");
        const activeSubscribers = await kvService.getActiveSubscribers();
        if (activeSubscribers.length === 0) {
            console.log("Cron job finished: No active subscribers to check.");
            return res.status(200).json({ message: 'No active subscribers.' });
        }

        const now = new Date();
        const expiredUserEmails: string[] = [];

        for (const email of activeSubscribers) {
            const user = await kvService.getUserByEmail(email);
            if (user?.planExpiryDate && new Date(user.planExpiryDate) < now) {
                await kvService.updateUser(email, { subscriptionStatus: 'expired' });
                await kvService.removeActiveSubscriber(email); // Remove from active set
                expiredUserEmails.push(email);
            }
        }
        
        if (expiredUserEmails.length > 0) {
            console.log(`Cron job finished: Expired ${expiredUserEmails.length} users.`);
            return res.status(200).json({ message: `Expired ${expiredUserEmails.length} users.`, expiredUsers: expiredUserEmails });
        }
        
        console.log("Cron job finished: No plans expired today.");
        return res.status(200).json({ message: 'No plans expired today.' });

    } catch (error) {
        console.error('Error in check-expirations cron job:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}