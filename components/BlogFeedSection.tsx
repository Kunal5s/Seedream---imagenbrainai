import React, { useState, useEffect } from 'react';
import { BlogPost } from '../data/blogData';
import { getArticles } from '../services/articleService';
import Spinner from './ui/Spinner';
import ArticleCard from './ArticleCard';

const POSTS_PER_PAGE = 15;

const BlogFeedSection: React.FC = () => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const fetchedPosts = await getArticles();
        setAllPosts(fetchedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load articles.');
      } finally {
        setIsLoading(false);
      }
    };
    loadArticles();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + POSTS_PER_PAGE);
  };

  const visiblePosts = allPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allPosts.length;

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
    
    if (allPosts.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          <h3 className="text-xl font-bold mb-2">No Articles Found</h3>
          <p>The blog feed appears to be empty.</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="bg-gray-800 text-green-300 font-bold py-3 px-8 rounded-lg border border-green-400/30 transition-all duration-300 ease-in-out transform hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/20 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            >
              Learn More Seedream Imagenbrainai
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Latest Feed Seedream Imagenbrainai
        </span>
      </h2>
      {renderContent()}
    </section>
  );
};

export default BlogFeedSection;