import type { VercelRequest, VercelResponse } from '@vercel/node';

const FEED_URL = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default/-/Seedream%20Imagenbrainai?alt=json&start-index=26&max-results=25';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers for all responses to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    try {
        const externalApiResponse = await fetch(FEED_URL);
        
        if (!externalApiResponse.ok) {
            const errorText = await externalApiResponse.text();
            console.error(`Blogspot Feed Error: ${externalApiResponse.status} - ${errorText}`);
            return res.status(externalApiResponse.status).json({ message: `External API Error: ${errorText || externalApiResponse.statusText}` });
        }
        
        const data = await externalApiResponse.json();
        
        // Vercel Hobby plan has a 10s timeout, but caching can help.
        // Cache for 15 minutes on the CDN and 5 minutes on the browser.
        res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate, public, max-age=300');
        
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error in Vercel rss-proxy function:', error);
        const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        return res.status(500).json({ message: 'Internal Server Error', error: message });
    }
}