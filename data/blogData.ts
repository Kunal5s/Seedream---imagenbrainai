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