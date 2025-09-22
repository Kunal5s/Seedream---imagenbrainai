import React, { useEffect, useRef } from 'react';
import { Article } from '../data/rssData';
import ArrowLeftIcon from './ui/ArrowLeftIcon';
import ExternalLinkIcon from './ui/ExternalLinkIcon';

interface ArticleDetailViewProps {
  article: Article;
  allArticles: Article[];
  onBack: () => void;
  onInternalLinkClick: (guid: string) => void;
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, allArticles, onBack, onInternalLinkClick }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        // Find links within the article content that point to other articles in the feed
        const links = contentEl.querySelectorAll('a');
        links.forEach(link => {
            const matchingArticle = allArticles.find(a => a.link === link.href);
            // If a match is found, override its click behavior to navigate internally
            if (matchingArticle) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    onInternalLinkClick(matchingArticle.guid);
                });
                // Style the link to indicate it's an internal, clickable article link
                link.style.textDecoration = 'underline';
                link.style.color = '#6ee7b7';
                link.style.cursor = 'pointer';
            }
        });
        
    }, [article.guid, allArticles, onInternalLinkClick]);

    return (
        <div className="bg-gray-900/50 p-4 sm:p-8 rounded-lg border border-gray-800">
            <button onClick={onBack} className="flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors mb-6 font-semibold">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Feed
            </button>
            <article>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 leading-tight mb-4">{article.title}</h1>
                <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b border-gray-700 gap-4">
                    <span>{new Date(article.pubDate).toLocaleString()}</span>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-green-300 transition-colors">
                        View Original <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                </div>

                <div 
                  ref={contentRef}
                  className="prose prose-invert prose-lg max-w-none prose-a:text-green-300 prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: article.content }} 
                />
            </article>
        </div>
    );
};

export default ArticleDetailView;