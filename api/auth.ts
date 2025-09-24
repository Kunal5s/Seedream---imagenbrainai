import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import type { LicenseStatus } from '../services/licenseService';
import { kvService, UserData, kv, resetTokenKey } from '../services/kvService';

const handleSignup = async (req: VercelRequest, res: VercelResponse) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });

    const existingUser = await kvService.getUserByEmail(email);
    if (existingUser) return res.status(409).json({ message: 'An account with this email already exists.' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    await kvService.createUser({ name, email, passwordHash, plan: 'Free Trial', credits: 500 });
    return res.status(201).json({ message: 'User created successfully.' });
};

const handleLogin = async (req: VercelRequest, res: VercelResponse) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await kvService.getUserByEmail(email);
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials.' });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not configured');

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

    const userData: LicenseStatus = { name: user.name, email: user.email, plan: user.plan, credits: user.credits, planExpiryDate: user.planExpiryDate, subscriptionStatus: user.subscriptionStatus };
    return res.status(200).json({ token, user: userData });
};

const handleGoogleAuth = async (req: VercelRequest, res: VercelResponse) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) return res.status(501).json({ message: "Google Sign-In is not configured." });

    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential token is required.' });
    
    const googleClient = new OAuth2Client(googleClientId);
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();
    
    if (!payload?.email) return res.status(400).json({ message: 'Invalid Google token.' });
    
    let user = await kvService.getUserByEmail(payload.email);
    if (!user) {
        user = await kvService.createUser({ name: payload.name || 'Google User', email: payload.email, plan: 'Free Trial', credits: 500 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not configured');
    
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
    const userData: LicenseStatus = { name: user.name, email: user.email, plan: user.plan, credits: user.credits, planExpiryDate: user.planExpiryDate, subscriptionStatus: user.subscriptionStatus };

    return res.status(200).json({ token, user: userData });
};

const handleRequestReset = async (req: VercelRequest, res: VercelResponse) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    
    const user = await kvService.getUserByEmail(email);
    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour
        await kvService.updateUser(email, { resetToken, resetTokenExpires });
        await kv.set(resetTokenKey(resetToken), email, { ex: 3600 });
        
        const resetUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/#/reset-password/${resetToken}`;
        console.log(`Password reset link for ${email}: ${resetUrl}`);
        
        return res.status(200).json({ 
            message: 'If an account with that email exists, a password reset link has been sent.',
            resetLink: resetUrl 
        });
    }
    
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
};

const handleReset = async (req: VercelRequest, res: VercelResponse) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });

    const user = await kvService.findUserByResetToken(token);

    if (!user?.email) return res.status(400).json({ message: 'This password reset token is invalid or has expired.' });

    const passwordHash = await bcrypt.hash(password, 10);
    await kvService.updateUser(user.email, { passwordHash, resetToken: undefined, resetTokenExpires: undefined });
    await kv.del(resetTokenKey(token));

    return res.status(200).json({ message: 'Your password has been reset successfully.' });
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    const { action } = req.query;

    try {
        switch (action) {
            case 'signup': return await handleSignup(req, res);
            case 'login': return await handleLogin(req, res);
            case 'google': return await handleGoogleAuth(req, res);
            case 'request-reset': return await handleRequestReset(req, res);
            case 'reset': return await handleReset(req, res);
            default: return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        console.error(`Error in auth handler (action: ${action}):`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}