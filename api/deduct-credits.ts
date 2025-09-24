

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LicenseStatus } from '../services/licenseService';
import { getXataClient } from '../services/xataService';
import { verifyToken } from '../services/authService';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing.' });
    }
    
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount (number) is required.' });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        
        const userId = decoded.userId;
        const userRecord = await xata.db.users.read(userId);
        
        if (!userRecord) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check for plan validity
        if (userRecord.plan !== 'Free Trial') {
            const isExpired = !userRecord.planExpiryDate || new Date(userRecord.planExpiryDate) < new Date();
            const isActive = userRecord.subscriptionStatus === 'active';

            if (isExpired || !isActive) {
                 return res.status(403).json({ message: 'Your plan has expired. Please purchase a new plan to continue generating images.' });
            }
        }

        if ((userRecord.credits || 0) < amount) {
            return res.status(402).json({ message: 'Insufficient credits for this action.' });
        }
        
        const updatedRecord = await userRecord.update({
            credits: (userRecord.credits || 0) - amount
        });

        // FIX: Add missing 'name' property to match LicenseStatus type.
        const responseData: LicenseStatus = {
            name: updatedRecord.name,
            email: updatedRecord.email!,
            plan: updatedRecord.plan as LicenseStatus['plan'],
            credits: updatedRecord.credits!,
            key: updatedRecord.key,
            planExpiryDate: updatedRecord.planExpiryDate?.toISOString() || null,
            subscriptionStatus: updatedRecord.subscriptionStatus,
        };
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error deducting credits:`, error);
         if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
             return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
