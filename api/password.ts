import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const xata = getXataClient();

const handleRequestReset = async (req: VercelRequest, res: VercelResponse) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const lowerCaseEmail = email.toLowerCase();
    const user = await xata.db.users.filter({ email: lowerCaseEmail }).getFirst();
    
    if (!user) {
        console.log(`Password reset requested for non-existent user: ${email}`);
        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await user.update({
        resetToken: hashedToken,
        resetTokenExpires: tokenExpires,
    });

    const resetUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/#/reset-password/${resetToken}`;

    console.log(`Password reset link for ${email}: ${resetUrl}`);
    
    return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        resetLink: resetUrl 
    });
};

const handleReset = async (req: VercelRequest, res: VercelResponse) => {
    const { token, password } = req.body;

    if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await xata.db.users
        .filter({
            resetToken: hashedToken,
            resetTokenExpires: { $gt: new Date() }
        })
        .getFirst();

    if (!user) {
        return res.status(400).json({ message: 'This password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
    });

    return res.status(200).json({ message: 'Your password has been reset successfully.' });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    const { action } = req.query;

    try {
        switch (action) {
            case 'request-reset':
                return await handleRequestReset(req, res);
            case 'reset':
                return await handleReset(req, res);
            default:
                return res.status(400).json({ message: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error(`Error in password handler for action "${action}":`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}