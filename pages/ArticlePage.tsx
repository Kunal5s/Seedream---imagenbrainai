import React, { useEffect, useState, useMemo } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { BlogPost } from '../data/blogData';
import { getArticleBySlug } from '../services/articleService';
import Spinner from '../components/ui/Spinner';
import AuthorBio from '../components/AuthorBio';

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

  const contentWithoutFirstImage = useMemo(() => {
    if (!article?.content) return '';
    // Use the browser's DOM parser to safely manipulate the HTML string
    // This prevents the featured image from appearing a second time inside the article body.
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(article.content, 'text/html');
        const firstImage = doc.querySelector('img');
        if (firstImage) {
          firstImage.remove();
        }
        return doc.body.innerHTML;
    } catch (e) {
        // Fallback in case of parsing error
        return article.content;
    }
  }, [article?.content]);


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

  if (!article) {
    return (
      <div className="text-center bg-yellow-900/20 text-yellow-300 p-6 rounded-lg max-w-4xl mx-auto" role="alert">
        <h2 className="text-2xl font-bold mb-2">404 - Article Not Found</h2>
        <p>The requested article could not be found.</p>
        <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</ReactRouterDom.Link>
      </div>
    );
  }
  
  // FIX: Simplified author handling. The service now guarantees author is always a full object.
  const author = article.author;

  return (
    <>
      <MetaTags
        title={`${article.title} | Seedream AI Blog`}
        description={article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <ReactRouterDom.Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors font-semibold">&larr; Back to All Articles</ReactRouterDom.Link>
        </div>
        
        <article>
            {article.featuredImage && (
                <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover rounded-lg mb-8" />
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-green-300 leading-tight mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-8 pb-4 border-b border-gray-700 gap-4">
                <span>Published on {new Date(article.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {author && <span>By {author.name}</span>}
            </div>
             <div 
                className="prose prose-invert prose-lg max-w-none prose-a:text-green-300 prose-headings:text-green-200 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: contentWithoutFirstImage }} 
            />
        </article>
        
        {author && (
            <div className="mt-12 pt-8 border-t border-gray-700">
                <AuthorBio author={author} />
            </div>
        )}
      </div>
    </>
  );
};

export default ArticlePage;