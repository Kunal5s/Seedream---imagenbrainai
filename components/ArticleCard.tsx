
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { BlogPost } from '../data/blogData';

interface ArticleCardProps {
  post: BlogPost;
}

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

const ArticleCard: React.FC<ArticleCardProps> = ({ post }) => {
  return (
    <motion.div variants={cardVariants}>
      <Link
        to={`/blog/${post.slug}`}
        className="block h-full bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden transform hover:scale-105 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col group"
      >
        <div className="relative aspect-video bg-gray-800">
          <img
            src={post.featuredImage || 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex flex-wrap gap-2 mb-2">
            {post.categories.slice(0, 2).map(cat => (
              <span key={cat} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{cat}</span>
            ))}
          </div>
          <h2 className="text-xl font-bold text-green-300 mb-3 group-hover:text-green-200 transition-colors line-clamp-2">{post.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed flex-grow line-clamp-3">{post.excerpt}</p>
          <span className="mt-4 text-green-400 font-semibold text-sm self-start">
            Read More &rarr;
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ArticleCard;