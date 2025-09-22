import React, { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { BlogPost } from '../data/blogData';
import { getArticles } from '../services/articleService';
import Spinner from '../components/ui/Spinner';

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

// Animation for each individual blog post card
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
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
          <motion.div key={post.slug} variants={cardVariants}>
            <ReactRouterDom.Link
              to={`/blog/${post.slug}`}
              className="block h-full bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden transform hover:scale-105 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col group"
            >
              <div className="relative aspect-video bg-gray-800">
                <img
                  src={post.featuredImage || 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.categories.slice(0, 2).map(cat => (
                    <span key={cat} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{cat}</span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-green-300 mb-3 group-hover:text-green-200 transition-colors">{post.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{post.excerpt}</p>
                <span className="mt-4 text-green-400 font-semibold text-sm self-start">
                  Read More &rarr;
                </span>
              </div>
            </ReactRouterDom.Link>
          </motion.div>
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
