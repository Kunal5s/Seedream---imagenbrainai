import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RssChannel, Article } from '../data/rssData';

// --- Helper Functions ---

const slugify = (text: string): string => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');
};

const enhanceBloggerThumbnail = (url: string | null): string | null => {
    if (!url) return null;
    // Request a larger, widescreen image for better quality cards
    return url.replace(/\/(s\d+(-[a-zA-Z])?|w\d+-h\d+(-[a-zA-Z])?)\//, '/w1200-h630-c/');
};

const cleanText = (html: string): string => {
    if (!html) return '';
    // 1. First, strip HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // 2. Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // 3. Replace multiple whitespace characters with a single space and trim
    text = text.replace(/\s\s+/g, ' ').trim();
    return text;
};

// --- Type definition for Blogger's JSON feed structure ---

interface BloggerJsonFeed {
    feed: {
        title: { $t: string };
        subtitle: { $t: string };
        link: { rel: string; href: string }[];
        entry?: any[];
    }
}

// --- Main Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // noCache query parameter is no longer needed but we won't break old clients
    const { url, startIndex = '1', maxResults = '25' } = req.query;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ message: 'A valid `url` query parameter is required.' });
    }

    try {
        // No caching - fetch directly from the source every time for real-time updates.
        
        const feedUrl = new URL(url);
        feedUrl.searchParams.set('alt', 'json');
        feedUrl.searchParams.set('start-index', startIndex as string);
        feedUrl.searchParams.set('max-results', maxResults as string);
        
        const response = await fetch(feedUrl.toString());
        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
        }

        const data: BloggerJsonFeed = await response.json();

        // Map the Blogger JSON to our clean data structure
        const channel: RssChannel = {
            title: data.feed.title.$t,
            description: data.feed.subtitle.$t,
            link: data.feed.link.find(l => l.rel === 'alternate')?.href || url,
        };

        const articles: Article[] = (data.feed.entry || []).map(entry => {
            const title = entry.title.$t;
            const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '';
            const guid = entry.id.$t;
            const content = entry.content?.$t || entry.summary?.$t || '';
            const description = cleanText(entry.summary?.$t || content).substring(0, 250);

            return {
                guid,
                id: guid,
                slug: slugify(title),
                link,
                title,
                pubDate: entry.published.$t,
                description,
                content,
                thumbnail: enhanceBloggerThumbnail(entry.media$thumbnail?.url || null),
                isNew: false,
            };
        });

        const responsePayload = { channel, articles };

        // Set headers to explicitly prevent any client, proxy, or CDN caching.
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        return res.status(200).json(responsePayload);

    } catch (error) {
        console.error(`Error in /api/articles for URL ${url}:`, error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return res.status(500).json({ message });
    }
}