import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../data/blogData';
import { getArticles } from '../data/blogData';

const FooterBlogFeed: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const allPosts = await getArticles();
        // Get the most recent 3 posts
        setPosts(allPosts.slice(0, 3));
      } catch (error) {
        console.error("Failed to load recent posts for footer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecentPosts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-500 text-sm">Loading posts...</p>;
    }

    if (posts.length > 0) {
      return (
        <ul className="space-y-3">
          {posts.map(post => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="text-gray-400 hover:text-green-300 transition-colors text-sm leading-snug block">
                {post.title}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors text-sm font-semibold mt-2 block">
              View All Posts &rarr;
            </Link>
          </li>
        </ul>
      );
    }
    
    return <p className="text-gray-500 text-sm">No recent posts found.</p>;
  }

  return (
    <div>
      <h4 className="font-semibold text-green-300 tracking-wider uppercase mb-4">Recent Posts</h4>
      {renderContent()}
    </div>
  );
};

export default FooterBlogFeed;