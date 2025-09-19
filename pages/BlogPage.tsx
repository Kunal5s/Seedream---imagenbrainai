import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import Spinner from '../components/ui/Spinner';
import { motion, Variants } from 'framer-motion';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  categories: string[];
}

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/rss-proxy');

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message = errorData?.message || `Failed to fetch blog posts (status: ${response.status})`;
          throw new Error(message);
        }

        const data = await response.json();
        setPosts(data as BlogPost[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        if (err instanceof SyntaxError) {
          setError("Failed to communicate with the server. The response was not in the expected format.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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

        {loading && (
          <div className="flex justify-center py-20" aria-live="polite">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="text-center bg-red-900/20 text-red-300 p-6 rounded-lg" role="alert">
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post) => (
              <motion.div key={post.slug} variants={cardVariants}>
                <Link
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
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default BlogPage;