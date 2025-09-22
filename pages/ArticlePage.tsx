import React, { useEffect, useState } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { BlogPost } from '../data/blogData';
import { getArticleBySlug } from '../services/articleService';
import Spinner from '../components/ui/Spinner';

const ArticlePage: React.FC = () => {
  const { slug } = ReactRouterDom.useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogPost | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
        const loadArticle = async () => {
            try {
                const fetchedArticle = await getArticleBySlug(slug);
                setArticle(fetchedArticle);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load article data.");
            }
        };
        loadArticle();
    }
  }, [slug]);

  if (article === undefined) {
      return (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      );
  }

  if (error) {
    return (
     <div className="text-center text-red-400 py-20 bg-red-900/20 rounded-lg max-w-4xl mx-auto">
       <h2 className="text-2xl font-bold mb-2">Error Loading Article Data</h2>
       <p>{error}</p>
       <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</ReactRouterDom.Link>
     </div>
   );
  }

  if (!article || !article.originalUrl) {
    return (
      <div className="text-center bg-yellow-900/20 text-yellow-300 p-6 rounded-lg max-w-4xl mx-auto" role="alert">
        <h2 className="text-2xl font-bold mb-2">404 - Article Not Found</h2>
        <p>The requested article could not be found or does not have a valid source URL to display.</p>
        <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</ReactRouterDom.Link>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title={`${article.title} | Seedream AI Blog`}
        description={article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
            <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors font-semibold">&larr; Back to All Articles</ReactRouterDom.Link>
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-green-300 transition-colors">
                Open in New Tab &rarr;
            </a>
        </div>
        <div 
            className="w-full border-4 border-green-400/20 rounded-lg overflow-hidden bg-gray-800"
            style={{ height: 'calc(100vh - 220px)' }} // Adjust height to fit within viewport minus header/footer
        >
            <iframe
                src={article.originalUrl}
                title={article.title}
                className="w-full h-full bg-white"
                allow="fullscreen"
                aria-label={`Embedded content for ${article.title}`}
            />
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
