import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateArticleMetadata } from '../services/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { content, topic } = req.body;

    if (!content || !topic) {
        return res.status(400).json({ message: 'Article content and topic are required.' });
    }

    try {
        const metadata = await generateArticleMetadata(content, topic);
        res.status(200).json(metadata);
    } catch (error) {
        console.error('Error in generate-metadata function:', error);
        const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        res.status(500).json({ message });
    }
}
