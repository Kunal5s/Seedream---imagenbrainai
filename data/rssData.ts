// This file contains the data structures specifically for the RSS Feed Reader.

export interface Article {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  description: string;
  content: string;
  thumbnail: string | null;
  isNew?: boolean; // Optional flag for newly fetched articles
}

export interface RssChannel {
    title: string;
    description: string;
    link: string;
}