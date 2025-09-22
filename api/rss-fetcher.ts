import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    
    const { url } = req.query;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ message: 'A valid `url` query parameter starting with http/https is required.' });
    }

    try {
        // Use a more browser-like set of headers to prevent servers from blocking the request.
        // A Firefox User-Agent is sometimes less likely to be blocked than a Chrome one.
        // The Referer header is often crucial for bypassing simple bot detection.
        const urlObject = new URL(url);
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
            'Accept': 'application/xml;q=0.9, application/rss+xml;q=0.8, */*;q=0.1',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': `${urlObject.protocol}//${urlObject.host}/`,
            'Connection': 'keep-alive',
        };

        const externalApiResponse = await fetch(url, { headers, redirect: 'follow' });
        
        if (!externalApiResponse.ok) {
            console.error(`External Feed Error: ${externalApiResponse.status} - ${externalApiResponse.statusText} for URL: ${url}`);
            
            let friendlyMessage = `The feed server responded with an error: ${externalApiResponse.status} ${externalApiResponse.statusText}.`;
            if (externalApiResponse.status === 404) {
                friendlyMessage = "The feed server responded with 404 (Not Found). This could mean the URL is incorrect, or the server is actively blocking automated requests from services like ours.";
            } else if (externalApiResponse.status === 403) {
                friendlyMessage = "Access to this feed is forbidden (403 Forbidden). The server is blocking automated requests.";
            } else if (externalApiResponse.status >= 500) {
                friendlyMessage = `The feed server is experiencing an internal error (${externalApiResponse.status}). Please try again later.`;
            }
            return res.status(externalApiResponse.status).json({ message: friendlyMessage });
        }
        
        const contentType = externalApiResponse.headers.get('content-type') || 'application/xml';
        const body = await externalApiResponse.text();
        
        if (!contentType.includes('xml') && !contentType.includes('html') && !body.trim().startsWith('<')) {
             return res.status(400).json({ message: `The URL did not return a valid XML feed. The response Content-Type was "${contentType}".`});
        }
        
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate, public, max-age=120');
        res.setHeader('Content-Type', contentType);
        
        return res.status(200).send(body);

    } catch (error) {
        console.error('Error in Vercel rss-fetcher proxy for URL:', url, error);
        let message = 'An unknown internal server error occurred while trying to fetch the feed.';
        if (error instanceof Error) {
            if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
                 message = 'Could not connect to the feed server. This may be due to a network issue, an invalid domain name, or a strict firewall on the server.';
            } else if (error.message.includes('Invalid URL')) { // Standard URL constructor error
                message = 'The provided URL is not valid. Please check the format (e.g., it should start with http:// or https://).';
            } else {
                message = `An unexpected error occurred: ${error.message}`;
            }
        }
        return res.status(500).json({ message: message });
    }
}