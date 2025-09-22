import { RssChannel, Article } from '../data/rssData';

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
        // This regex is designed to find Blogger/Google user content image URLs
        // and replace the size parameter (like s72-c, s1600, w200-h100) with a specific high-quality one.
        return url.replace(/\/(s\d+(-[a-zA-Z])?|w\d+-h\d+(-[a-zA-Z])?)\//, '/w400-h225-c/');
    } catch {
        return url; // Return original URL if regex fails
    }
};

/**
 * Gets the text content from the first matching tag in a list of potential tags.
 * @param node The parent element to search within.
 * @param tags An array of tag names to check in order.
 * @returns The text content of the first found element, or an empty string.
 */
const getNodeValue = (node: Element | Document, tags: string[]): string => {
    for (const tag of tags) {
        // Correctly escape the colon for querySelector, which is needed for namespaced tags.
        const selector = tag.replace(':', '\\:');
        const element = node.querySelector(selector);
        if (element?.textContent) {
            return element.textContent.trim();
        }
    }
    return '';
};

/**
 * Extracts the full HTML content of an article by checking various tags in order of preference.
 * This is the core fix for the querySelector error.
 * @param item The <item> or <entry> element.
 * @returns The full HTML content as a string.
 */
const getFullContent = (item: Element): string => {
    // 1. Try 'content:encoded' first, as it's typically the full post in RSS.
    // The selector needs to have the colon escaped for querySelector.
    const contentEncoded = item.querySelector('content\\:encoded');
    if (contentEncoded?.textContent) return contentEncoded.textContent.trim();
    
    // 2. Try Atom's 'content' tag.
    const content = item.querySelector('content');
    if (content?.textContent) return content.textContent.trim();

    // 3. Fall back to RSS 'description' which often contains the full HTML.
    const description = item.querySelector('description');
    if (description?.textContent) return description.textContent.trim();

    // 4. Fall back to Atom's 'summary'.
    const summary = item.querySelector('summary');
    if (summary?.textContent) return summary.textContent.trim();

    return '';
}

/**
 * Extracts a thumbnail image from various possible tags within an item.
 * @param item The <item> or <entry> element.
 * @returns A URL string for the thumbnail, or null if not found.
 */
const getThumbnail = (item: Element): string | null => {
    // Try media:content first (common in many feeds)
    const mediaContent = item.querySelector('media\\:content');
    if (mediaContent && mediaContent.getAttribute('url')) {
        return mediaContent.getAttribute('url');
    }

    // Try enclosure tag (standard in RSS 2.0)
    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image/')) {
        return enclosure.getAttribute('url');
    }

    // Try parsing the first <img> tag from the full content HTML as a last resort
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
        // Check if it's a Blogger-like feed to apply pagination
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
            console.error("XML Parse Error:", parseError.textContent);
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
            
            // Use the robust getNodeValue for tags that can have different names
            const pubDate = getNodeValue(item, ['pubDate', 'published', 'updated']);
            const guid = getNodeValue(item, ['guid', 'id']) || link;

            const content = getFullContent(item);
            
            // For the preview description, create a stripped, shortened plain text version
            const description = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 250);
            
            return {
                guid,
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
            if (error.message.includes("parse")) {
                 throw new Error("The feed was fetched, but its content is not valid RSS/Atom XML.");
            }
            throw error;
        }
        throw new Error("An unknown error occurred while processing the feed.");
    }
};