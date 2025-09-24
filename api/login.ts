
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { LicenseStatus } from '../services/licenseService';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const userRecord = await xata.db.users.filter({ email: lowerCaseEmail }).getFirst();

        if (!userRecord || !userRecord.password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, userRecord.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not set in environment variables.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const token = jwt.sign(
            { userId: userRecord.id, email: userRecord.email },
            jwtSecret,
            { expiresIn: '7d' } // Token is valid for 7 days
        );

        const userData: LicenseStatus = {
            name: userRecord.name,
            email: userRecord.email!,
            plan: userRecord.plan as LicenseStatus['plan'],
            credits: userRecord.credits!,
            key: userRecord.key,
            planExpiryDate: userRecord.planExpiryDate?.toISOString() || null,
            subscriptionStatus: userRecord.subscriptionStatus
        };

        return res.status(200).json({ token, user: userData });

    } catch (error) {
        console.error('Error in login function:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}