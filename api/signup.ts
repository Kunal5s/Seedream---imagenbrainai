
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getXataClient } from '../services/xataService';
import bcrypt from 'bcryptjs';

const xata = getXataClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name || typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
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

    } catch (error) {
        console.error('Error in signup function:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}