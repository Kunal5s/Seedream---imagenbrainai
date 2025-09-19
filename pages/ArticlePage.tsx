import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import AuthorBio from '../components/AuthorBio';
import Spinner from '../components/ui/Spinner';
import { motion } from 'framer-motion';

// Author info is hardcoded as the RSS feed only provides the name.
// This can be updated if the feed changes in the future.
const authorInfo = {
  name: 'Kunal Sonpitre',
  avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=kunalsonpitre',
  bio: 'Kunal is a tech enthusiast and AI art evangelist based in Nashik. With a passion for exploring the intersection of human creativity and artificial intelligence, he delves into the latest advancements in generative technology. Through his articles on Seedream ImagenBrainAi, he aims to empower creators to unlock new possibilities in the digital art landscape.',
  location: 'Nashik, Maharashtra, India',
};

// Type definitions for the fetched post and author data.
interface Author {
  name: string;
  avatarUrl: string;
  bio: string;
  location:string;
}
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published: string;
  author: Author;
  featuredImage: string | null;
  categories: string[];
}

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/rss-proxy');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const message = errorData?.message || `Failed to fetch article data (status: ${response.status})`;
            throw new Error(message);
        }

        const posts = await response.json();
        const foundArticle = (posts as any[]).find((post: any) => post.slug === slug);
        
        if (foundArticle) {
          setArticle({
            ...foundArticle,
            author: authorInfo // Attach the static author info to the fetched post
          });
        } else {
          throw new Error(`Article with slug "${slug}" not found.`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        if (err instanceof SyntaxError) {
            setError("Failed to communicate with the server. The response was not in the expected format.");
        } else {
            setError(errorMessage);
        }
        // Redirect after a delay to allow user to read the error
        setTimeout(() => navigate('/blog'), 4000);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
        fetchArticle();
    }
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-20" aria-live="polite">
        <Spinner />
      </div>
    );
  }

  if (error || !article) {
    return (
        <div className="text-center bg-red-900/20 text-red-300 p-6 rounded-lg max-w-4xl mx-auto" role="alert">
            <h2 className="text-2xl font-bold mb-2">Error Loading Article</h2>
            <p>{error || 'Could not load the article. Redirecting to blog...'}</p>
            <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</Link>
        </div>
    );
  }

  const formattedDate = new Date(article.published).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <MetaTags
        title={`${article.title} | Seedream AI Blog`}
        description={article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
      />
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="mb-8">
            <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors">&larr; Back to Blog</Link>
        </div>
        
        <article>
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400 mb-3">
                {article.title}
            </h1>
            <p className="text-gray-400 text-base">Published on {formattedDate}</p>
            <div className="flex flex-wrap gap-2 mt-3">
                {article.categories.map(cat => (
                    <span key={cat} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">{cat}</span>
                ))}
            </div>
          </div>
        
          {article.featuredImage && (
              <img src={article.featuredImage} alt={article.title} className="rounded-lg my-8 w-full h-auto object-cover" />
          )}

          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-green-300 prose-a:text-green-300 prose-strong:text-green-200 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.content }} 
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
          <AuthorBio author={article.author} />
        </div>
      </motion.div>
    </>
  );
};

export default ArticlePage;