import { RssChannel, Article } from '../data/rssData';

/**
 * Converts a string into a URL-friendly slug.
 * @param text The text to convert.
 * @returns A URL-friendly slug string.
 */
const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Intelligently enhances thumbnail URLs from Blogger/Google feeds.
 * Replaces low-resolution size parameters (e.g., /s72-c/) with a high-quality,
 * consistently sized equivalent (/w400-h225-c/) for crisp, clear visuals.
 * @param url The original thumbnail URL.
 * @returns The enhanced, high-quality thumbnail URL.
 */
const enhanceBloggerThumbnail = (url: string | null): string | null => {
    if (!url) return null;
    try {
        return url.replace(/\/(s\d+(-[a-zA-Z])?|w\d+-h\d+(-[a-zA-Z])?)\//, '/w400-h225-c/');
    } catch {
        return url;
    }
};

const getNodeValue = (node: Element | Document, tags: string[]): string => {
    for (const tag of tags) {
        const selector = tag.replace(':', '\\:');
        const element = node.querySelector(selector);
        if (element?.textContent) {
            return element.textContent.trim();
        }
    }
    return '';
};

const getFullContent = (item: Element): string => {
    const contentEncoded = item.querySelector('content\\:encoded');
    if (contentEncoded?.textContent) return contentEncoded.textContent.trim();
    
    const content = item.querySelector('content');
    if (content?.textContent) return content.textContent.trim();

    const description = item.querySelector('description');
    if (description?.textContent) return description.textContent.trim();

    const summary = item.querySelector('summary');
    if (summary?.textContent) return summary.textContent.trim();

    return '';
}

const getThumbnail = (item: Element): string | null => {
    const mediaContent = item.querySelector('media\\:content');
    if (mediaContent && mediaContent.getAttribute('url')) {
        return mediaContent.getAttribute('url');
    }

    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image/')) {
        return enclosure.getAttribute('url');
    }

    const contentHtml = getFullContent(item);
    const match = contentHtml.match(/<img[^>]+src="([^">]+)"/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
};

/**
 * Fetches and parses an RSS/Atom feed from a given URL via a public proxy.
 * Supports pagination for Blogger-based feeds.
 * @param url The URL of the RSS feed.
 * @param startIndex The starting index for fetching articles (for pagination).
 * @param maxResults The maximum number of articles to fetch (for pagination).
 * @returns A promise that resolves to an object containing channel info and a list of articles.
 */
export const fetchAndParseRssFeed = async (url: string, startIndex = 1, maxResults = 25): Promise<{ channel: RssChannel; articles: Article[] }> => {
    try {
        let feedUrl = url;
        if (url.includes('/feeds/posts/default')) {
            const urlObject = new URL(url);
            urlObject.searchParams.set('start-index', String(startIndex));
            urlObject.searchParams.set('max-results', String(maxResults));
            urlObject.searchParams.set('alt', 'rss');
            feedUrl = urlObject.toString();
        }
        
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch feed via proxy. Status: ${response.status}. Details: ${errorText}`);
        }

        const xmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "application/xml");

        const parseError = doc.querySelector("parsererror");
        if (parseError) {
            throw new Error("Failed to parse the feed. The source may not be a valid XML format.");
        }

        const isAtom = doc.querySelector('feed') !== null;
        
        const channelTitle = doc.querySelector(isAtom ? 'feed > title' : 'channel > title')?.textContent?.trim() || '';
        const channelDescription = doc.querySelector(isAtom ? 'feed > subtitle' : 'channel > description')?.textContent?.trim() || '';
        const channelLinkNode = doc.querySelector(isAtom ? 'feed > link[rel="alternate"]' : 'channel > link');
        const channelLink = channelLinkNode ? (channelLinkNode.getAttribute('href') || channelLinkNode.textContent?.trim()) : '';

        const channel: RssChannel = {
            title: channelTitle,
            description: channelDescription,
            link: channelLink || url,
        };

        const items = doc.querySelectorAll(isAtom ? 'entry' : 'item');
        const articles: Article[] = Array.from(items).map(item => {
            const title = item.querySelector('title')?.textContent?.trim() || '';
            const linkNode = item.querySelector('link');
            const link = linkNode?.getAttribute('href') || linkNode?.textContent?.trim() || '';
            
            const pubDate = getNodeValue(item, ['pubDate', 'published', 'updated']);
            const guid = getNodeValue(item, ['guid', 'id']) || link;
            const content = getFullContent(item);
            const description = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 250);

            // Generate slug and extract unique ID for permalinks
            const slug = slugify(title);
            const idMatch = guid.match(/\.post-(\d+)$/);
            const id = idMatch ? idMatch[1] : guid;
            
            return {
                guid,
                id,
                slug,
                link,
                title,
                pubDate,
                description,
                content,
                thumbnail: enhanceBloggerThumbnail(getThumbnail(item)),
                isNew: false,
            };
        });

        return { channel, articles };

    } catch (error) {
        console.error(`Error fetching or parsing feed from ${url}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while processing the feed.");
    }
};