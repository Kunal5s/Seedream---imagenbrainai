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
  author: string | Author; // The API returns a string, the app uses the full Author object.
  featuredImage: string | null;
  categories: string[];
  keywords?: string[];
  originalUrl: string;
}

// FIX: Decoupled RSS interfaces into their own file `data/rssData.ts`.
// This file is now only for blog-specific data structures.
// To avoid breaking changes with other components that might still reference it,
// we will create the new file instead of renaming this one.
// The new file will contain the Article and RssChannel interfaces.
