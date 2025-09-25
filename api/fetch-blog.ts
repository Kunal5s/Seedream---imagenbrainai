// api/fetch-blog.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// A simple in-memory cache to store the fetched data and a timestamp.
let cache = {
  data: null,
  timestamp: 0,
};

// Cache duration: 5 minutes in milliseconds.
const CACHE_DURATION = 5 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const now = Date.now();

  // If we have a valid cache, return it immediately.
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  const bloggerUrl = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=json';

  try {
    const fetchResponse = await fetch(bloggerUrl);
    if (!fetchResponse.ok) {
      throw new Error(`Blogger API responded with status: ${fetchResponse.statusText}`);
    }
    
    const data = await fetchResponse.json();
    
    // Update the cache.
    cache = {
      data: data,
      timestamp: now,
    };
    
    // Set caching headers for the browser and Vercel's edge network.
    res.setHeader('Cache-Control', `s-maxage=${CACHE_DURATION / 1000}, stale-while-revalidate`);
    res.setHeader('X-Cache', 'MISS');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching from Blogger API:", error);
    // If fetching fails, serve stale cache data if available to improve resilience.
    if (cache.data) {
        res.setHeader('X-Cache', 'STALE');
        return res.status(200).json(cache.data);
    }
    return res.status(500).json({ message: 'Failed to fetch blog posts from the source.' });
  }
}
