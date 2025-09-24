
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LicenseStatus } from '../services/licenseService';
import { getXataClient } from '../services/xataService';
import { verifyToken } from '../services/authService';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing.' });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        
        const userId = decoded.userId;
        const userRecord = await xata.db.users.read(userId);

        if (!userRecord) {
            return res.status(404).json({ message: 'User not found for this token.' });
        }
        
        const responseData: LicenseStatus = {
            name: userRecord.name,
            email: userRecord.email!,
            plan: userRecord.plan as LicenseStatus['plan'],
            credits: userRecord.credits!,
            key: userRecord.key,
            planExpiryDate: userRecord.planExpiryDate?.toISOString() || null,
            subscriptionStatus: userRecord.subscriptionStatus
        };
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error fetching user profile:`, error);
        if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
             return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}