import React, { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { BlogPost } from '../data/blogData';
import { getArticles } from '../services/articleService';
import Spinner from '../components/ui/Spinner';
import ArticleCard from '../components/ArticleCard';

// Staggered animation for the container of the blog posts
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // This creates the sequential animation
    },
  },
};

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const fetchedPosts = await getArticles();
        setPosts(fetchedPosts);
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
          <p>The blog feed appears to be empty. Please check back later.</p>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <>
      <MetaTags
        title="Blog | Seedream ImagenBrainAi 4.0"
        description="Explore articles, insights, and guides on leveraging the power of AI art with Seedream ImagenBrainAi 4.0. Stay updated on new features, tips, and creative inspiration."
        canonicalPath="/blog"
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              The Seedream AI Blog
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Insights, tutorials, and inspiration for the future of creativity.
          </p>
        </div>
        
        {renderContent()}
      </div>
    </>
  );
};

export default BlogPage;