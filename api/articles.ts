import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
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
    
    const { url, startIndex = '1', maxResults = '25' } = req.query;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ message: 'A valid `url` query parameter is required.' });
    }

    const CACHE_TTL = 30; // Cache for 30 seconds
    const urlSlug = slugify(url);
    const page = Math.floor(parseInt(startIndex as string, 10) / parseInt(maxResults as string, 10)) + 1;
    const cacheKey = `blogger-feed:${urlSlug}:page:${page}`;

    try {
        // 1. Check KV Cache first
        const cachedData = await kv.get<{ channel: RssChannel; articles: Article[] }>(cacheKey);
        if (cachedData) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate, public, max-age=30');
            return res.status(200).json(cachedData);
        }

        res.setHeader('X-Cache', 'MISS');

        // 2. If not in cache, fetch from the source using the JSON endpoint
        const feedUrl = new URL(url);
        feedUrl.searchParams.set('alt', 'json');
        feedUrl.searchParams.set('start-index', startIndex as string);
        feedUrl.searchParams.set('max-results', maxResults as string);
        
        const response = await fetch(feedUrl.toString());
        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
        }

        const data: BloggerJsonFeed = await response.json();

        // 3. Map the Blogger JSON to our clean data structure
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
            const description = (entry.summary?.$t || content).replace(/<[^>]*>/g, '').substring(0, 250);

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

        // 4. Store the result in KV Cache for future requests
        await kv.set(cacheKey, responsePayload, { ex: CACHE_TTL });
        
        // Set browser and CDN caching headers for the initial response
        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate, public, max-age=30');
        
        return res.status(200).json(responsePayload);

    } catch (error) {
        console.error(`Error in /api/articles for URL ${url}:`, error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return res.status(500).json({ message });
    }
}