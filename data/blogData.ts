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

// --- Dynamic Blog Data Fetching ---

// Define a default author profile, as the Blogger API only provides the name.
const defaultAuthor: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

// In-memory cache to store fetched posts and avoid redundant API calls on the client-side
let cachedPosts: BlogPost[] | null = null;

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
 * Fetches and parses articles from our own internal, reliable API endpoint.
 * @returns A promise that resolves to an array of BlogPost objects.
 */
const fetchAndParseArticles = async (): Promise<BlogPost[]> => {
    // Point to our new, reliable serverless function
    const apiUrl = '/api/fetch-blog';
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from internal API with status: ${response.statusText}`);
        }
        
        const bloggerData = await response.json();

        if (!bloggerData.feed || !Array.isArray(bloggerData.feed.entry)) {
            console.warn('Blogger data format is unexpected or contains no entries:', bloggerData);
            return [];
        }

        const posts: BlogPost[] = bloggerData.feed.entry.map((entry: any): BlogPost => {
            const contentHtml = entry.content?.$t || '';
            
            // Create a simple excerpt by stripping HTML and truncating
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            const excerpt = textContent.substring(0, 150) + '...';

            // Get a higher resolution featured image if available
            let imageUrl = entry['media$thumbnail']?.url || null;
            if (imageUrl) {
                // Request a larger image for better quality
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

        // Sort by date, most recent first
        return posts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    } catch (error) {
        console.error("Error fetching or parsing blog articles:", error);
        throw new Error("Could not load articles. Please check your connection and try again.");
    }
};

/**
 * Returns all articles, using a cache to avoid re-fetching on the client.
 * The server-side function also has its own cache for performance.
 * @param forceRefresh - If true, bypasses the client cache and re-fetches data.
 * @returns A promise that resolves to an array of BlogPost objects.
 */
export const getArticles = async (forceRefresh = false): Promise<BlogPost[]> => {
  if (cachedPosts && !forceRefresh) {
    return Promise.resolve(cachedPosts);
  }
  
  const posts = await fetchAndParseArticles();
  cachedPosts = posts;
  return posts;
};

/**
 * Finds a single article by its slug.
 * @param slug - The slug of the article to find.
 * @returns A promise that resolves to a single BlogPost or undefined if not found.
 */
export const getArticleBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  // Ensure the articles are fetched and cached first
  const articles = await getArticles();
  const article = articles.find(post => post.slug === slug);
  return article;
};

// New type file for shared types
export { }; // This can be removed if types are in a separate file, but here it keeps the structure.