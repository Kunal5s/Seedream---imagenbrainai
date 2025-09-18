import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { blogData } from '../data/blogData';

const BlogPage: React.FC = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.map((post) => (
            <Link 
              to={`/blog/${post.slug}`} 
              key={post.slug}
              className="block bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden transform hover:scale-105 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col group"
            >
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-green-300 mb-3 group-hover:text-green-200 transition-colors">{post.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{post.excerpt}</p>
                <span className="mt-4 text-green-400 font-semibold text-sm self-start">
                  Read More &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogPage;