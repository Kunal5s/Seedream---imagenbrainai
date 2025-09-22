
import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../services/rssService';
import { summarizeArticle } from '../services/geminiService';
import Spinner from './ui/Spinner';
import ArrowLeftIcon from './ui/ArrowLeftIcon';
import ExternalLinkIcon from './ui/ExternalLinkIcon';
import Button from './ui/Button';

interface ArticleDetailViewProps {
  article: Article;
  allArticles: Article[];
  onBack: () => void;
  onInternalLinkClick: (guid: string) => void;
}

const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, allArticles, onBack, onInternalLinkClick }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const generateSummary = async () => {
            if (!article.content) {
                setSummary('No content available to summarize.');
                return;
            }
            setIsSummarizing(true);
            setSummaryError(null);
            setSummary(null);
            try {
                // Strip HTML tags for a clean summary prompt
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = article.content;
                const textContent = tempDiv.textContent || tempDiv.innerText || "";
                
                if (!textContent.trim()) {
                    setSummary('Article content is empty or contains only images.');
                    return;
                }
                
                const result = await summarizeArticle(textContent);
                setSummary(result);
            } catch (err) {
                setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary.');
            } finally {
                setIsSummarizing(false);
            }
        };

        generateSummary();
    }, [article.guid, article.content, retryCount]);
    
    useEffect(() => {
        const contentEl = contentRef.current;
        if (!contentEl) return;

        const links = contentEl.querySelectorAll('a');
        links.forEach(link => {
            const matchingArticle = allArticles.find(a => a.link === link.href);
            if (matchingArticle) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    onInternalLinkClick(matchingArticle.guid);
                });
                link.style.textDecoration = 'underline';
                link.style.color = '#6ee7b7';
                link.style.cursor = 'pointer';
            }
        });
        
    }, [article.guid, allArticles, onInternalLinkClick]);

    const handleRetrySummary = () => {
        setRetryCount(prev => prev + 1);
    };

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

                <div className="bg-gray-900/70 border border-green-400/20 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-green-300 mb-3">AI Summary (via Gemini)</h2>
                    {isSummarizing && (
                         <div className="flex items-center gap-3 text-gray-400 italic">
                            <div className="w-5 h-5 border-2 border-t-green-300 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <span>Generating summary...</span>
                        </div>
                    )}
                    {summaryError && (
                        <div className='text-red-400 text-center p-4 bg-red-900/20 rounded-md'>
                            <p className='font-semibold mb-2'>Error Generating Summary</p>
                            <p className='text-sm mb-4'>{summaryError}</p>
                            <div className='max-w-[150px] mx-auto'>
                                <Button onClick={handleRetrySummary} variant='secondary'>Retry</Button>
                            </div>
                        </div>
                    )}
                    {summary && <p className="text-gray-300 whitespace-pre-line">{summary}</p>}
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
