import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../pages/BlogPage'; // Re-use the interface

const FooterBlogFeed: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rss-proxy');

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message = errorData?.message || `Failed to fetch posts (status: ${response.status})`;
          throw new Error(message);
        }
        
        const data = await response.json();
        setPosts(data.slice(0, 3)); // Get the latest 3 posts
      } catch (err) {
        console.error("Failed to load footer blog feed:", err);
        // Silently fail in the footer to not disrupt the UI
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading || posts.length === 0) {
    // Render nothing if loading or if there are no posts to show
    return null;
  }

  return (
    <div className="border-t border-gray-700 pt-8">
      <h4 className="font-semibold text-green-300 tracking-wider uppercase mb-4 text-center">
        Latest Articles
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link 
            key={post.slug} 
            to={`/blog/${post.slug}`}
            className="group p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <img 
                src={post.featuredImage || 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
                alt={post.title}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                loading="lazy"
              />
              <div>
                <h5 className="text-sm font-bold text-gray-200 group-hover:text-green-300 transition-colors line-clamp-2">
                  {post.title}
                </h5>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FooterBlogFeed;
