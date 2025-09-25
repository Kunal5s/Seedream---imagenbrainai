export interface Author {
  name: string;
  avatarUrl: string;
  bio: string;
  location: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published: string;
  author: Author;
  featuredImage: string | null;
  categories: string[];
  keywords?: string[];
  originalUrl: string;
}

// --- Article Fetching Logic ---

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

const cleanTextForClient = (html: string): string => {
    if (!html) return '';
    // This logic should only run in the browser, not during a server-side build.
    if (typeof window === 'undefined') {
        let text = html.replace(/<[^>]*>/g, '');
        text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return text.replace(/[\s\u00A0]+/g, ' ').trim();
    }
    try {
        const tempEl = document.createElement('div');
        tempEl.innerHTML = html;
        const text = tempEl.textContent || '';
        return text.replace(/[\s\u00A0]+/g, ' ').trim();
    } catch (e) {
        console.error("DOM-based text cleaning failed, falling back to regex.", e);
        let text = html.replace(/<[^>]*>/g, '');
        text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return text.replace(/[\s\u00A0]+/g, ' ').trim();
    }
};

interface BloggerJsonFeed {
    feed: {
        title: { $t: string };
        subtitle: { $t: string };
        link: { rel: string; href: string }[];
        entry?: any[];
    }
}

const authorInfo: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

export const getArticles = async (forceRefresh = false): Promise<BlogPost[]> => {
  try {
    const BLOGGER_BASE_URL = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default';
    const MAX_RESULTS = 100;

    const feedUrl = new URL(BLOGGER_BASE_URL);
    feedUrl.searchParams.set('alt', 'json');
    feedUrl.searchParams.set('start-index', '1');
    feedUrl.searchParams.set('max-results', String(MAX_RESULTS));
    
    if (forceRefresh) {
        feedUrl.searchParams.set('timestamp', Date.now().toString());
    }

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl.toString())}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
        throw new Error(`Failed to fetch articles. Server responded with status: ${proxyResponse.status}`);
    }
    
    const proxyData = await proxyResponse.json();
    if (proxyData.status && proxyData.status.http_code >= 400) {
         throw new Error(`Error from feed source: ${proxyData.status.http_code}. Please check the Blogger URL.`);
    }

    const bloggerJson: BloggerJsonFeed = JSON.parse(proxyData.contents);
    
    const apiArticles = (bloggerJson.feed.entry || []).map(entry => {
        const title = entry.title.$t;
        const content = entry.content?.$t || entry.summary?.$t || '';
        return {
            guid: entry.id.$t,
            slug: slugify(title),
            link: entry.link.find((l: any) => l.rel === 'alternate')?.href || '',
            title,
            pubDate: entry.published.$t,
            description: cleanTextForClient(entry.summary?.$t || content).substring(0, 250),
            content: content,
            thumbnail: enhanceBloggerThumbnail(entry.media$thumbnail?.url || null),
        };
    });

    const processedPosts: BlogPost[] = apiArticles.map(apiArticle => ({
      slug: apiArticle.slug,
      title: apiArticle.title,
      excerpt: apiArticle.description,
      content: apiArticle.content,
      published: apiArticle.pubDate,
      author: authorInfo,
      featuredImage: apiArticle.thumbnail,
      categories: [],
      keywords: [],
      originalUrl: apiArticle.link,
    }));
    
    processedPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return processedPosts;

  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

export const getArticleBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const articles = await getArticles();
  return articles.find(post => post.slug === slug);
};