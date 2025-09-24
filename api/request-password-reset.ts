
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import crypto from 'crypto';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email } = req.body;
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const user = await xata.db.users.filter({ email: lowerCaseEmail }).getFirst();
        
        // IMPORTANT: Always return a generic success message to prevent user enumeration attacks.
        // This stops bad actors from finding out which emails are registered.
        if (!user) {
            console.log(`Password reset requested for non-existent user: ${email}`);
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        
        // 1. Generate a secure, random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // 2. Hash the token before storing it in the database for security
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // 3. Set an expiration date for the token (e.g., 1 hour from now)
        const tokenExpires = new Date(Date.now() + 3600000); // 1 hour in milliseconds
        
        // 4. Update the user record in the database
        await user.update({
            resetToken: hashedToken,
            resetTokenExpires: tokenExpires,
        });

        // 5. In a real application, you would send an email with the reset link.
        // For this project, we will return the link directly for testing purposes.
        const resetUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/#/reset-password/${resetToken}`;

        console.log(`Password reset link generated for ${email}: ${resetUrl}`);
        
        return res.status(200).json({ 
            message: 'If an account with that email exists, a password reset link has been sent.',
            // NOTE: The `resetLink` is only returned for demonstration/testing purposes.
            // In a production environment, this link would be emailed to the user directly
            // and NOT sent back in the API response.
            resetLink: resetUrl 
        });

    } catch (error) {
        console.error('Error in request-password-reset function:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
