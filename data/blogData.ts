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
  author: Author; // FIX: Author is now always the full Author object, not a string.
  featuredImage: string | null;
  categories: string[];
  keywords?: string[];
  originalUrl: string;
}
