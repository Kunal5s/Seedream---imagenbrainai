import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateArticleSection } from '../services/geminiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { topic, keywords, sectionTitle } = req.body;

    if (!topic || !sectionTitle) {
        return res.status(400).json({ message: 'Topic and sectionTitle are required.' });
    }

    try {
        const content = await generateArticleSection(topic, keywords || '', sectionTitle);
        res.status(200).json({ content });
    } catch (error) {
        console.error('Error in generate-content-chunk function:', error);
        const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        res.status(500).json({ message });
    }
}
