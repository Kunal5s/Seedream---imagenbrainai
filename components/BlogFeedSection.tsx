import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import { BlogPost } from '../data/blogData';
import { getArticles } from '../data/blogData';
import Spinner from './ui/Spinner';
import ArticleCard from './ArticleCard';

const POSTS_TO_SHOW = 20; // Show 20 posts on the homepage

const BlogFeedSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const fetchedPosts = await getArticles();
        setPosts(fetchedPosts.slice(0, POSTS_TO_SHOW)); // Take only the first few
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles.');
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
          <h3 className="text-xl font-bold mb-2">Error Loading Articles</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          <h3 className="text-xl font-bold mb-2">No Articles Found</h3>
          <p>The blog is currently empty. Check back soon!</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="text-center mt-12">
            <ReactRouterDom.Link
              to="/blog"
              className="bg-gray-800 text-green-300 font-bold py-3 px-8 rounded-lg border border-green-400/30 transition-all duration-300 ease-in-out transform hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/20 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            >
              View All Posts
            </ReactRouterDom.Link>
        </div>
      </>
    );
  };

  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Seedream Imagenbrainai Feed
        </span>
      </h2>
      {renderContent()}
    </section>
  );
};

export default BlogFeedSection;