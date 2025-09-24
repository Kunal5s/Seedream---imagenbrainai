import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import type { LicenseStatus } from '../services/licenseService';

const xata = getXataClient();

const handleSignup = async (req: VercelRequest, res: VercelResponse) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name || typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const lowerCaseEmail = email.toLowerCase();
    const existingUser = await xata.db.users.filter({ email: lowerCaseEmail }).getFirst();
    if (existingUser) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await xata.db.users.create({
        name: name,
        email: lowerCaseEmail,
        password: hashedPassword,
        plan: 'Free Trial',
        credits: 500,
    });

    return res.status(201).json({ message: 'User created successfully.' });
};

const handleLogin = async (req: VercelRequest, res: VercelResponse) => {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

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
        console.error('JWT_SECRET is not set.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    const token = jwt.sign({ userId: userRecord.id, email: userRecord.email }, jwtSecret, { expiresIn: '7d' });

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
};

const handleGoogleAuth = async (req: VercelRequest, res: VercelResponse) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
        return res.status(501).json({ message: "Google Sign-In is not configured on the server." });
    }

    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
        return res.status(400).json({ message: 'Google credential token is required.' });
    }
    
    const googleClient = new OAuth2Client(googleClientId);
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
        return res.status(400).json({ message: 'Invalid Google token.' });
    }
    
    const googleEmail = payload.email.toLowerCase();
    const googleName = payload.name || 'Google User';

    let userRecord = await xata.db.users.filter({ email: googleEmail }).getFirst();
    if (!userRecord) {
        userRecord = await xata.db.users.create({
            email: googleEmail,
            name: googleName,
            plan: 'Free Trial',
            credits: 500,
        });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not set.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    
    const appToken = jwt.sign({ userId: userRecord.id, email: userRecord.email }, jwtSecret, { expiresIn: '7d' });

    const userData: LicenseStatus = {
        name: userRecord.name,
        email: userRecord.email!,
        plan: userRecord.plan as LicenseStatus['plan'],
        credits: userRecord.credits!,
        key: userRecord.key
    };

    return res.status(200).json({ token: appToken, user: userData });
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    const { action } = req.query;

    try {
        switch (action) {
            case 'signup':
                return await handleSignup(req, res);
            case 'login':
                return await handleLogin(req, res);
            case 'google':
                return await handleGoogleAuth(req, res);
            default:
                return res.status(400).json({ message: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error(`Error in auth handler for action "${action}":`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}