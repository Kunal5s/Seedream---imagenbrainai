import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { BlogPost } from '../data/blogData';
import { getArticleBySlug } from '../data/blogData';
import Spinner from '../components/ui/Spinner';
import AuthorBio from '../components/AuthorBio';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogPost | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
        const loadArticle = async () => {
            try {
                // Now fetches from the static, local data source
                const fetchedArticle = await getArticleBySlug(slug);
                setArticle(fetchedArticle);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load article data.");
                setArticle(null); // Set to null on error
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
       <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</Link>
     </div>
   );
  }

  if (!article) {
    return (
      <div className="text-center bg-yellow-900/20 text-yellow-300 p-6 rounded-lg max-w-4xl mx-auto" role="alert">
        <h2 className="text-2xl font-bold mb-2">404 - Article Not Found</h2>
        <p>The requested article could not be found.</p>
        <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors mt-4 inline-block">&larr; Back to Blog</Link>
      </div>
    );
  }
  
  const author = article.author;

  return (
    <>
      <MetaTags
        title={`${article.title} | Seedream Imagenbrainai Feed`}
        description={article.excerpt}
        canonicalPath={`/blog/${article.slug}`}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link to="/blog" className="text-green-300 hover:text-green-200 transition-colors font-semibold">&larr; Back to All Articles</Link>
        </div>
        
        <article>
            {article.featuredImage && (
                <img src={article.featuredImage} alt={article.title} className="w-full aspect-video object-cover rounded-lg mb-8" />
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold text-green-300 leading-tight mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-between text-sm text-green-300 mb-8 pb-4 border-b border-gray-700 gap-4">
                <span>Published on {new Date(article.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                {author && <span>By {author.name}</span>}
            </div>
             <div 
                className="prose prose-invert prose-lg max-w-none prose-a:text-green-300 prose-headings:text-green-200 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: article.content }} 
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