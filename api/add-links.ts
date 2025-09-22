import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addLinksToArticle } from '../services/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Article content is required.' });
    }

    try {
        const linkedContent = await addLinksToArticle(content);
        res.status(200).json({ content: linkedContent });
    } catch (error) {
        console.error('Error in add-links function:', error);
        const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        res.status(500).json({ message });
    }
}
