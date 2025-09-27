import React, { useState, useEffect, useCallback } from 'react';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { BlogPost } from '../data/blogData';
import { fetchArticles, BlogFeedResponse } from '../data/blogData';
import Spinner from '../components/ui/Spinner';
import ArticleCard from '../components/ArticleCard';
import Button from '../components/ui/Button';

// Staggered animation for the container of the blog posts
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);


const POSTS_PER_PAGE = 100;

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: BlogFeedResponse = await fetchArticles({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        query: searchQuery,
      });
      setPosts(response.posts);
      setTotalPages(Math.ceil(response.totalResults / POSTS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    setSearchQuery(searchInput);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
        window.scrollTo(0, 0);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        window.scrollTo(0, 0);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      );
    }
    
    if (error) {
      return (
       <div className="text-center text-red-400 py-20 bg-red-900/20 rounded-lg">
         <h2 className="text-2xl font-bold mb-2">Error Loading Posts</h2>
         <p>{error}</p>
       </div>
     );
   }

    if (posts.length === 0) {
      return (
        <div className="text-center text-gray-500 py-20">
          <h2 className="text-2xl font-bold mb-2">No Articles Found</h2>
          <p>{searchQuery ? `Your search for "${searchQuery}" did not return any results.` : 'The blog feed appears to be empty. Please check back later.'}</p>
        </div>
      );
    }

    return (
      <>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </motion.div>
      </>
    );
  };

  return (
    <>
      <MetaTags
        title="Seedream Imagenbrainai Feed | Seedream ImagenBrainAi"
        description="Explore articles, insights, and guides on leveraging the power of AI art with Seedream ImagenBrainAi. Stay updated on new features, tips, and creative inspiration."
        canonicalPath="/blog"
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Seedream Imagenbrainai Feed
                </span>
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
            Insights, tutorials, and inspiration for the future of creativity.
          </p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-12 flex gap-2">
            <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400"
            />
            <button type="submit" className="flex items-center justify-center gap-2 bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                <SearchIcon />
                <span>Search</span>
            </button>
        </form>

        {renderContent()}

        {totalPages > 1 && !isLoading && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <Button onClick={handlePrevPage} disabled={currentPage <= 1} variant="secondary">
                    &larr; Previous
                </Button>
                <span className="text-gray-400 font-semibold">
                    Page {currentPage} of {totalPages}
                </span>
                <Button onClick={handleNextPage} disabled={currentPage >= totalPages} variant="secondary">
                    Next &rarr;
                </Button>
            </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;
