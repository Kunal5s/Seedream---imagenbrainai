import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to create a URL-friendly slug from a post title
const createSlug = (title: string): string => {
    if (!title) return `post-${Date.now()}`;
    return title
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

// Helper to create a plain text excerpt from HTML content
const createExcerpt = (htmlContent: string, maxLength: number = 200): string => {
    if (!htmlContent) return '';
    const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return plainText.substring(0, maxLength) + '...';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Standard CORS and method handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.setHeader('Content-Type', 'application/json');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // Set content type for all subsequent responses
    res.setHeader('Content-Type', 'application/json');

    try {
        const rssFeedUrl = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=rss&max-results=500';
        const converterApiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeedUrl)}`;
        
        const apiResponse = await fetch(converterApiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        const responseBody = await apiResponse.text();

        if (!apiResponse.ok) {
            console.error(`Error from rss2json service: Status ${apiResponse.status}`, responseBody);
            return res.status(502).json({ 
                message: `The blog service is temporarily unavailable. Please try again later.`,
                error: `External service responded with status ${apiResponse.status}`
            });
        }
        
        let data;
        try {
            data = JSON.parse(responseBody);
        } catch (parseError) {
            console.error('Failed to parse response from rss2json. Body was:', responseBody);
            return res.status(502).json({
                message: 'Received an invalid response from the blog service.',
                error: 'Malformed JSON from external service.'
            });
        }

        if (data.status !== 'ok') {
            console.error('rss2json service reported an error:', data.message);
            return res.status(502).json({
                message: `The blog service reported an error.`,
                error: data.message || 'Unknown service error'
            });
        }
        
        const posts = data.items.map((item: any) => ({
            title: item.title,
            slug: createSlug(item.title),
            link: item.link,
            published: item.pubDate,
            author: item.author,
            categories: item.categories || [],
            content: item.content,
            featuredImage: item.thumbnail || null, 
            excerpt: createExcerpt(item.description), // Use the description field for the excerpt/summary
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
        return res.status(200).json(posts);

    } catch (error) {
        console.error('Unhandled error in RSS proxy function:', error);
        const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
        return res.status(500).json({ message: 'Internal Server Error', error: message });
    }
}