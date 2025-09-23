import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import { Article } from '../data/rssData';
import { fetchAndParseRssFeed } from '../services/rssService';
import Spinner from './ui/Spinner';
import RssArticleCard from './RssArticleCard';

const DEFAULT_FEED_URL = 'https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=rss';
const POSTS_TO_SHOW = 6;

const RssFeedSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { articles: fetchedArticles } = await fetchAndParseRssFeed(DEFAULT_FEED_URL, 1, POSTS_TO_SHOW);
        setArticles(fetchedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed.');
      } finally {
        setIsLoading(false);
      }
    };
    loadArticles();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 py-10 bg-red-900/20 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Error Loading Feed</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (articles.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          <h3 className="text-xl font-bold mb-2">No Articles Found</h3>
          <p>The latest feed appears to be empty.</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(post => (
            <RssArticleCard key={post.guid} post={post} />
          ))}
        </div>
        <div className="text-center mt-12">
            <ReactRouterDom.Link
              to="/feed-reader"
              className="bg-gray-800 text-green-300 font-bold py-3 px-8 rounded-lg border border-green-400/30 transition-all duration-300 ease-in-out transform hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/20 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            >
              View Full Feed
            </ReactRouterDom.Link>
        </div>
      </>
    );
  };

  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Latest From Our Feed
        </span>
      </h2>
      {renderContent()}
    </section>
  );
};

export default RssFeedSection;