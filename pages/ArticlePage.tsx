import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { blogData } from '../data/blogData';
import AuthorBio from '../components/AuthorBio';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const article = blogData.find(post => post.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    // Optional: Redirect to a 404 page or the blog index if article not found
    useEffect(() => {
      navigate('/blog');
    }, [navigate]);
    return null;
  }

  const formattedDate = new Date(article.publishedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <>
      <MetaTags
        title={`${article.title} | Seedream AI Blog`}
        description={article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors">&larr; Back to Blog</Link>
        </div>
        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-green-300 prose-a:text-green-300 prose-strong:text-green-200">
          <h1>{article.title}</h1>
          <p className="text-gray-400 text-base -mt-4">Published on {formattedDate}</p>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>
        
        <div className="mt-12 border-t border-green-400/20 pt-8">
          <div className="text-center mb-8">
            <a 
              href="https://www.imagenbrainai.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-br from-green-400 to-green-500 text-black font-bold text-lg py-3 px-8 rounded-lg shadow-lg shadow-green-400/20 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-green-400/40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400/50"
            >
              Welcome To Imagen BrainAi
            </a>
          </div>
          <AuthorBio author={article.author} />
        </div>
      </div>
    </>
  );
};

export default ArticlePage;