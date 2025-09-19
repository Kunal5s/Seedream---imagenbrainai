import React, { useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import AuthorBio from '../components/AuthorBio';
import { motion } from 'framer-motion';
import { Author, BlogPost } from '../data/blogData';
import { blogPosts } from '../data/blogPosts';

// Author info is hardcoded as the RSS feed only provides the name.
const authorInfo: Author = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

const ArticlePage: React.FC = () => {
  const { slug } = ReactRouterDom.useParams<{ slug: string }>();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const article = blogPosts.find((post) => post.slug === slug);

  if (!article) {
    return (
      <div className="text-center bg-yellow-900/20 text-yellow-300 p-6 rounded-lg max-w-4xl mx-auto" role="alert">
        <h2 className="text-2xl font-bold mb-2">404 - Article Not Found</h2>
        <p>The requested article could not be found. It might have been moved or deleted.</p>
        <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</ReactRouterDom.Link>
      </div>
    );
  }

  // Attach static author info to the found article
  const articleWithAuthor: BlogPost = {
      ...article,
      author: authorInfo
  };


  const formattedDate = new Date(articleWithAuthor.published).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <MetaTags
        title={`${articleWithAuthor.title} | Seedream AI Blog`}
        description={articleWithAuthor.excerpt}
        canonicalPath={`/blog/${articleWithAuthor.slug}`}
      />
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mb-8">
          <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors">&larr; Back to Blog</ReactRouterDom.Link>
        </div>

        <article>
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400 mb-3">
              {articleWithAuthor.title}
            </h1>
            <p className="text-gray-400 text-base">Published on {formattedDate}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {articleWithAuthor.categories.map(cat => (
                <span key={cat} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{cat}</span>
              ))}
            </div>
          </div>

          {articleWithAuthor.featuredImage && (
            <img src={articleWithAuthor.featuredImage} alt={articleWithAuthor.title} className="rounded-lg my-8 w-full h-auto object-cover" />
          )}

          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-green-300 prose-a:text-green-300 prose-strong:text-green-200 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: articleWithAuthor.content }}
          />
        </article>

        <div className="mt-12 border-t border-green-400/20 pt-8">
          <div className="text-center mb-8">
            <a
              href="https://www.imagenbrainai.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-br from-green-400 to-green-500 text-black font-bold text-lg py-3 px-8 rounded-lg shadow-lg shadow-green-400/20 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-400/40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400/50"
            >
              Start Creating with Imagen BrainAi
            </a>
          </div>
          <AuthorBio author={articleWithAuthor.author as Author} />
        </div>
      </motion.div>
    </>
  );
};

export default ArticlePage;