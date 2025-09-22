import { BlogPost, Author } from '../data/blogData';
import { blogPosts } from '../data/blogPosts';

// The author info is static as it's not fully available in the feed.
const authorInfo: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

// Process the static blog posts to conform to the BlogPost type with a full Author object.
const articles: BlogPost[] = blogPosts.map(post => ({
  ...post,
  author: authorInfo, // Replace string author with the full object
}));

// Sort posts by date, newest first.
articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

/**
 * Retrieves all blog posts from the static data file.
 * @returns {Promise<BlogPost[]>} A promise that resolves to an array of all available blog posts.
 */
export const getArticles = async (): Promise<BlogPost[]> => {
  return Promise.resolve(articles);
};

/**
 * Finds a single blog post by its slug from the static data file.
 * @param {string} slug The slug of the article to find.
 * @returns {Promise<BlogPost | undefined>} The found blog post or undefined if not found.
 */
export const getArticleBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const article = articles.find(post => post.slug === slug);
  return Promise.resolve(article);
};
