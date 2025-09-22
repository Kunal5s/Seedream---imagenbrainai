
export interface Article {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  content: string;
  thumbnail: string | null;
}

export interface RssChannel {
    title: string;
    description: string;
    link: string;
}

const getTextContent = (element: Element, ...selectors: string[]): string => {
    for (const selector of selectors) {
        const el = element.querySelector(selector);
        if (el?.textContent) {
            return el.textContent;
        }
    }
    return '';
};

const getThumbnail = (item: Element): string | null => {
    // 1. Prefer media:thumbnail (common in Atom/Blogger)
    const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
    if (mediaThumbnail && mediaThumbnail.getAttribute('url')) {
        return mediaThumbnail.getAttribute('url');
    }

    // 2. Then try media:content (common in RSS with media extensions)
    const mediaContent = item.querySelector('media\\:content, content');
    if (mediaContent && mediaContent.getAttribute('url') && mediaContent.getAttribute('medium') === 'image') {
        return mediaContent.getAttribute('url');
    }
    
    // 3. Then try enclosure (another RSS standard)
    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image/')) {
        return enclosure.getAttribute('url');
    }

    // 4. Fallback to the first img tag in the content
    const content = item.querySelector('content\\:encoded, encoded, content, summary, description')?.textContent || '';
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
};


export const fetchAndParseRss = async (url: string): Promise<{ channel: RssChannel, articles: Article[] }> => {
    try {
        // FIX: Replaced the internal proxy with a robust, public third-party proxy (AllOrigins)
        // This is a definitive fix for the CORS/404 blocking issues encountered with certain feeds.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            // AllOrigins might pass through the original error status, or have its own.
            throw new Error(`Failed to fetch feed through proxy. Status: ${response.status} ${response.statusText}. Please ensure the original URL is correct and publicly accessible.`);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'application/xml');
        
        const errorNode = doc.querySelector('parsererror');
        if (errorNode) {
            throw new Error('Failed to parse RSS feed. The document is not valid XML. Please check if the URL points to a valid RSS or Atom feed.');
        }

        const isAtom = doc.documentElement.tagName.toLowerCase() === 'feed';
        const channelSelector = isAtom ? 'feed' : 'channel';
        const itemSelector = isAtom ? 'entry' : 'item';
        
        const channelEl = doc.querySelector(channelSelector);
        if (!channelEl) {
            throw new Error(`Invalid feed: <${channelSelector}> tag not found.`);
        }

        const channel: RssChannel = {
            title: getTextContent(channelEl, 'title'),
            description: getTextContent(channelEl, 'description', 'subtitle'),
            link: channelEl.querySelector(isAtom ? 'link[rel="alternate"]' : 'link')?.getAttribute('href') || getTextContent(channelEl, 'link'),
        };

        const articles: Article[] = Array.from(doc.querySelectorAll(itemSelector)).map(item => {
            const descriptionText = getTextContent(item, 'description', 'summary');
            const contentText = getTextContent(item, 'content\\:encoded', 'encoded', 'content');
            
            return {
                guid: getTextContent(item, 'guid', 'id'),
                link: item.querySelector(isAtom ? 'link[rel="alternate"]' : 'link')?.getAttribute('href') || getTextContent(item, 'link'),
                title: getTextContent(item, 'title'),
                pubDate: getTextContent(item, 'pubDate', 'published', 'updated'),
                description: descriptionText.replace(/<[^>]*>?/gm, ''),
                content: contentText || descriptionText,
                thumbnail: getThumbnail(item),
            };
        });
        
        if (articles.length === 0) {
            console.warn('Feed parsed successfully, but no items were found.');
        }

        return { channel, articles };
    } catch (error) {
        console.error('Error in fetchAndParseRss:', error);
        if (error instanceof Error) {
            throw new Error(`Could not load or parse the feed. Details: ${error.message}`);
        }
        throw new Error('An unknown error occurred while processing the RSS feed.');
    }
};
