
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getXataClient } from '../services/xataService';
import type { LicenseStatus } from '../services/licenseService';

const xata = getXataClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // --- THIS IS A PLACEHOLDER IMPLEMENTATION ---
    // To make this fully functional, you need to:
    // 1. Go to the Google Cloud Console (console.cloud.google.com).
    // 2. Create a new project.
    // 3. Go to "APIs & Services" -> "Credentials".
    // 4. Create an "OAuth 2.0 Client ID" for a "Web application".
    // 5. Add your Vercel deployment URL to the "Authorized JavaScript origins".
    // 6. Copy the "Client ID" and add it to your Vercel Environment Variables as `GOOGLE_CLIENT_ID`.
    // 7. Add a frontend library like '@react-oauth/google' to trigger the Google login popup.
    console.warn("Google Sign-In API endpoint is not fully configured. A GOOGLE_CLIENT_ID environment variable is required.");
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(501).json({ message: "Google Sign-In is not configured on the server. A GOOGLE_CLIENT_ID is missing." });
    }
    // --- END OF PLACEHOLDER NOTICE ---

    const { credential } = req.body; // 'credential' is the JWT provided by Google Sign-In

    if (!credential || typeof credential !== 'string') {
        return res.status(400).json({ message: 'Google credential token is required.' });
    }

    try {
        // Verify the token from Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google token.' });
        }
        
        const googleEmail = payload.email.toLowerCase();
        const googleName = payload.name || 'Google User';

        // Find or create user in our database
        let userRecord = await xata.db.users.filter({ email: googleEmail }).getFirst();

        if (!userRecord) {
            // If user does not exist, create a new one
            userRecord = await xata.db.users.create({
                email: googleEmail,
                name: googleName,
                plan: 'Free Trial',
                credits: 500, // New users from Google also get free credits
                // No password needed for OAuth users
            });
        }
        
        // We have a valid user, now create our own app's JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not set in environment variables.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const appToken = jwt.sign(
            { userId: userRecord.id, email: userRecord.email },
            jwtSecret,
            { expiresIn: '7d' }
        );

        const userData: LicenseStatus = {
            name: userRecord.name,
            email: userRecord.email!,
            plan: userRecord.plan as LicenseStatus['plan'],
            credits: userRecord.credits!,
            key: userRecord.key
        };

        return res.status(200).json({ token: appToken, user: userData });

    } catch (error) {
        console.error('Error in Google auth function:', error);
        return res.status(500).json({ message: 'Internal Server Error during Google authentication.' });
    }
}