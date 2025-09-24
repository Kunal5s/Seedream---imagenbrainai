
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { token, password } = req.body;

    if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        // Hash the incoming token to match the one stored in the database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the user with the matching token that has not expired
        const user = await xata.db.users
            .filter({
                resetToken: hashedToken,
                resetTokenExpires: { $gt: new Date() } // Check if expiry date is in the future
            })
            .getFirst();

        if (!user) {
            return res.status(400).json({ message: 'This password reset token is invalid or has expired.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update the user's password and clear the reset token fields
        await user.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpires: null,
        });

        return res.status(200).json({ message: 'Your password has been reset successfully.' });

    } catch (error) {
        console.error('Error in reset-password function:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
