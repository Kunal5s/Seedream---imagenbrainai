import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { BlogPost } from '../data/blogData';

const FooterBlogFeed: React.FC = () => {
  const posts: BlogPost[] = blogPosts.slice(0, 3); // Only show the 3 most recent posts

  const renderContent = () => {
    if (posts.length > 0) {
      return (
        <ul className="space-y-3">
          {posts.map(post => (
            <li key={post.slug}>
              <ReactRouterDom.Link to={`/blog/${post.slug}`} className="text-gray-400 hover:text-green-300 transition-colors text-sm leading-snug block">
                {post.title}
              </ReactRouterDom.Link>
            </li>
          ))}
          <li>
            <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors text-sm font-semibold mt-2 block">
              View All Posts &rarr;
            </ReactRouterDom.Link>
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