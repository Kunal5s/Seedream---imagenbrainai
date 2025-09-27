// api/fetch-blog.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This function now handles pagination, custom page sizes, and search queries.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get query parameters with defaults.
  const startIndex = req.query.startIndex || '1';
  const maxResults = req.query['max-results'] || '100'; // Default to 100 posts per page as requested.
  const searchQuery = req.query.q || '';

  // Dynamically build the Blogger API URL.
  let bloggerUrl = `https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=json&max-results=${maxResults}&start-index=${startIndex}`;

  // Add the search query parameter if it exists.
  if (searchQuery) {
    bloggerUrl += `&q=${encodeURIComponent(searchQuery as string)}`;
  }

  try {
    const fetchResponse = await fetch(bloggerUrl);
    if (!fetchResponse.ok) {
      throw new Error(`Blogger API responded with status: ${fetchResponse.statusText}`);
    }
    
    const data = await fetchResponse.json();
    
    // Set caching headers for Vercel's edge network (5 minutes).
    res.setHeader('Cache-Control', `s-maxage=300, stale-while-revalidate`);
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching from Blogger API:", error);
    return res.status(500).json({ message: 'Failed to fetch blog posts from the source.' });
  }
}
