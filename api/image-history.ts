import type { VercelRequest, VercelResponse } from '@vercel/node';
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

        // Fetch all images for the user, sorted by creation date descending
        const images = await xata.db.generated_images
            .filter({ user: userId })
            .sort('xata.createdAt', 'desc')
            .getAll();
            
        return res.status(200).json(images);

    } catch (error) {
        console.error(`Error fetching image history:`, error);
        if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
             return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
