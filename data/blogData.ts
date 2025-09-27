// data/blogData.ts

// Define shared types for author and blog post structures.
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
  content: string; // Full HTML content
  published: string;
  author: Author;
  featuredImage: string | null;
  categories: string[];
  keywords?: string[];
}

export interface BlogFeedResponse {
    posts: BlogPost[];
    totalResults: number;
}

// --- Dynamic Blog Data Fetching ---

// Define a default author profile, as the Blogger API only provides the name.
const defaultAuthor: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

// In-memory cache to store fetched posts by page/query to avoid redundant API calls
const cache = new Map<string, BlogFeedResponse>();


/**
 * Creates a URL-friendly slug from a string.
 * @param title The title to convert.
 * @returns The slugified title.
 */
const createSlug = (title: string): string => {
  if (!title) return `untitled-${Date.now()}`;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
};

/**
 * Fetches and parses a paginated and searchable set of articles from our internal API.
 * @param page The current page number to fetch.
 * @param limit The number of posts per page.
 * @param query Optional search query string.
 * @returns A promise that resolves to a BlogFeedResponse object.
 */
export const fetchArticles = async ({ page = 1, limit = 100, query = '' }: { page?: number, limit?: number, query?: string }): Promise<BlogFeedResponse> => {
    const startIndex = (page - 1) * limit + 1;
    const cacheKey = `page=${page}&limit=${limit}&query=${query}`;
    
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
    }

    const apiUrl = `/api/fetch-blog?startIndex=${startIndex}&max-results=${limit}&q=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch from internal API with status: ${response.statusText}. Body: ${errorBody}`);
        }
        
        const bloggerData = await response.json();

        if (!bloggerData.feed || !bloggerData.feed.openSearch$totalResults) {
            console.warn('Blogger data format is unexpected or contains no entries:', bloggerData);
            return { posts: [], totalResults: 0 };
        }
        
        const totalResults = parseInt(bloggerData.feed.openSearch$totalResults.$t, 10);
        const entries = bloggerData.feed.entry || [];

        const posts: BlogPost[] = entries.map((entry: any): BlogPost => {
            const contentHtml = entry.content?.$t || '';
            
            // Create excerpt safely in the browser context
            let excerpt = 'No content available.';
            if (typeof document !== 'undefined') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = contentHtml;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
            }

            let imageUrl = entry['media$thumbnail']?.url || null;
            if (imageUrl) {
                // Request a larger, higher-quality image from Blogger's servers
                imageUrl = imageUrl.replace(/\/s\d+(-c)?\//, '/s1600/');
            }
            
            const authorName = entry.author?.[0]?.name?.$t || 'Anonymous';

            return {
                slug: createSlug(entry.title.$t),
                title: entry.title.$t,
                excerpt: excerpt,
                content: contentHtml,
                published: entry.published.$t,
                author: { ...defaultAuthor, name: authorName },
                featuredImage: imageUrl,
                categories: entry.category?.map((cat: any) => cat.term) || [],
            };
        });
        
        const result = { posts, totalResults };
        cache.set(cacheKey, result); // Store result in cache

        return result;

    } catch (error) {
        console.error("Error fetching or parsing blog articles:", error);
        throw new Error("Could not load articles. Please check your connection and try again.");
    }
};

/**
 * Fetches all articles by paginating through the results. Used for site-wide operations like finding a slug.
 * @returns A promise resolving to all blog posts.
 */
export const getAllArticles = async (): Promise<BlogPost[]> => {
    let allPosts: BlogPost[] = [];
    let page = 1;
    let totalResults = 0;
    const limit = 100; // Fetch in chunks of 100

    do {
        const response = await fetchArticles({ page, limit });
        allPosts = allPosts.concat(response.posts);
        totalResults = response.totalResults;
        page++;
    } while (allPosts.length < totalResults);

    return allPosts;
}


/**
 * Finds a single article by its slug.
 * This can be slow for large blogs as it may need to fetch all posts.
 * @param slug - The slug of the article to find.
 * @returns A promise that resolves to a single BlogPost or undefined if not found.
 */
export const getArticleBySlug = async (slug: string): Promise<BlogPost | undefined> => {
    // This is a simplified approach. For a very large blog, a dedicated API endpoint would be better.
    // However, given the Blogger API limitations, a full client-side fetch is a feasible workaround.
    const allPosts = await getAllArticles();
    return allPosts.find(post => post.slug === slug);
};
