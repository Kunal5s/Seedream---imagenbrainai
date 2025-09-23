import { BlogPost, Author } from '../data/blogData';

// --- Helper Functions (for dev mode) ---
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

const cleanTextForDev = (html: string): string => {
    if (!html) return '';
    try {
        // This is the most reliable way for client-side execution.
        // It uses the browser's own parser to strip HTML tags and decode all entities.
        const tempEl = document.createElement('div');
        tempEl.innerHTML = html;
        const text = tempEl.textContent || '';
        // Finally, normalize all whitespace (including non-breaking spaces) into single spaces.
        return text.replace(/[\s\u00A0]+/g, ' ').trim();
    } catch (e) {
        console.error("DOM-based text cleaning failed, falling back to regex.", e);
        // Fallback for any unexpected environment where document might not be available.
        let text = html.replace(/<[^>]*>/g, '');
        text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return text.replace(/[\s\u00A0]+/g, ' ').trim();
    }
};


// --- Interfaces for raw Blogger JSON data ---
interface BloggerJsonFeed {
    feed: {
        title: { $t: string };
        subtitle: { $t: string };
        link: { rel: string; href: string }[];
        entry?: any[];
    }
}

// This is the structure our API returns. It's cleaner.
interface ApiArticle {
  guid: string;
  slug: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  content: string;
  thumbnail: string | null;
}

// Consistent author info
const authorInfo: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

const transformApiArticleToBlogPost = (apiArticle: ApiArticle): BlogPost => {
  return {
    slug: apiArticle.slug,
    title: apiArticle.title,
    excerpt: apiArticle.description,
    content: apiArticle.content,
    published: apiArticle.pubDate,
    author: authorInfo,
    featuredImage: apiArticle.thumbnail,
    categories: [], // Categories are not in the Blogger feed, so we leave this empty.
    keywords: [],
    originalUrl: apiArticle.link,
  };
};

/**
 * Fetches all articles from the Blogger feed.
 * It uses a different strategy for development vs. production to ensure functionality in both environments.
 * @param {boolean} [forceRefresh=false] - If true, bypasses all server-side caches.
 * @returns {Promise<BlogPost[]>} A promise that resolves to an array of all available blog posts.
 */
export const getArticles = async (forceRefresh = false): Promise<BlogPost[]> => {
  try {
    let apiArticles: ApiArticle[];
    const BLOGGER_BASE_URL = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default';
    const MAX_RESULTS = 100;

    // Use a robust method to check for development environment.
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
        // --- DEVELOPMENT MODE: Fetch via public CORS proxy ---
        const feedUrl = new URL(BLOGGER_BASE_URL);
        feedUrl.searchParams.set('alt', 'json');
        feedUrl.searchParams.set('start-index', '1');
        feedUrl.searchParams.set('max-results', String(MAX_RESULTS));

        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl.toString())}`;
        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) {
            throw new Error(`Failed to fetch feed via proxy. Status: ${proxyResponse.status}`);
        }
        const proxyData = await proxyResponse.json();
        if (proxyData.status && proxyData.status.http_code >= 400) {
             throw new Error(`Error from feed source: ${proxyData.status.http_code}. Please check the Blogger URL.`);
        }

        const bloggerJson: BloggerJsonFeed = JSON.parse(proxyData.contents);
        
        // Transform raw Blogger data into our clean ApiArticle structure
        apiArticles = (bloggerJson.feed.entry || []).map(entry => {
            const title = entry.title.$t;
            const content = entry.content?.$t || entry.summary?.$t || '';
            return {
                guid: entry.id.$t,
                slug: slugify(title),
                link: entry.link.find((l: any) => l.rel === 'alternate')?.href || '',
                title,
                pubDate: entry.published.$t,
                description: cleanTextForDev(entry.summary?.$t || content).substring(0, 250),
                content: content,
                thumbnail: enhanceBloggerThumbnail(entry.media$thumbnail?.url || null),
            };
        });

    } else {
        // --- PRODUCTION MODE: Fetch from our Vercel API endpoint ---
        const bloggerRssUrl = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=rss';
        let apiUrl = `/api/articles?url=${encodeURIComponent(bloggerRssUrl)}&startIndex=1&maxResults=${MAX_RESULTS}`;
        
        if (forceRefresh) {
            // Add a parameter to bypass all server-side caches (CDN and KV)
            apiUrl += `&noCache=true`;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Failed to fetch articles. Server responded with status: ${response.status}` }));
            throw new Error(errorData.message || 'Failed to fetch articles.');
        }

        const data: { articles: ApiArticle[] } = await response.json();
        
        if (!data.articles) {
            throw new Error("API response was successful but did not contain an 'articles' array.");
        }
        apiArticles = data.articles;
    }
    
    // The final transformation to the BlogPost format used by the UI
    const processedPosts = apiArticles.map(transformApiArticleToBlogPost);
    processedPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return processedPosts;

  } catch (error) {
    console.error("Error fetching articles:", error);
    // Re-throw the error so the UI component can display a message
    throw error;
  }
};

/**
 * Finds a single blog post by its slug. It fetches all articles first
 * and then finds the specific one.
 * @param {string} slug The slug of the article to find.
 * @returns {Promise<BlogPost | undefined>} The found blog post or undefined if not found.
 */
export const getArticleBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const articles = await getArticles();
  return articles.find(post => post.slug === slug);
};