

import React, { useState, useEffect, FormEvent } from 'react';
import { fetchAndParseRss, Article, RssChannel } from '../services/rssService';
import ArticleDetailView from '../components/ArticleDetailView';
import MetaTags from '../components/MetaTags';
import RefreshIcon from '../components/ui/RefreshIcon';
import Button from '../components/ui/Button';
import ArticleCardSkeleton from '../components/ArticleCardSkeleton';
// FIX: Import `Variants` type from framer-motion to resolve TypeScript error.
import { motion, Variants } from 'framer-motion';

const DEFAULT_FEED_URL = 'https://www.imagenbrainai.in/feeds/posts/default?alt=rss';

// FIX: Explicitly type variants with `Variants` to ensure correct type inference.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// FIX: Explicitly type variants with `Variants` to ensure correct type inference for transition properties.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};


const FeedReaderPage: React.FC = () => {
    const [feedUrl, setFeedUrl] = useState<string>(DEFAULT_FEED_URL);
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [channel, setChannel] = useState<RssChannel | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadFeed = async (url: string) => {
        if (!url) {
            setError('Please provide a valid RSS feed URL.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setArticles([]);
        setChannel(null);
        setSelectedArticle(null);
        setCurrentUrl(url);

        try {
            const { channel: fetchedChannel, articles: fetchedArticles } = await fetchAndParseRss(url);
            setChannel(fetchedChannel);
            setArticles(fetchedArticles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the feed.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeed(DEFAULT_FEED_URL);
    }, []);

    const handleFetch = (e: FormEvent) => {
        e.preventDefault();
        loadFeed(feedUrl);
    };

    const handleArticleClick = (article: Article) => {
        setSelectedArticle(article);
        window.scrollTo(0, 0);
    };
    
    const handleInternalLink = (guid: string) => {
        const article = articles.find(a => a.guid === guid);
        if (article) {
            setSelectedArticle(article);
            window.scrollTo(0, 0);
        }
    }

    if (selectedArticle) {
        return (
            <ArticleDetailView
                article={selectedArticle}
                allArticles={articles}
                onBack={() => setSelectedArticle(null)}
                onInternalLinkClick={handleInternalLink}
            />
        );
    }

    const renderContent = () => {
      if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="w-3/4 h-8 bg-gray-700/50 rounded animate-pulse"></div>
                {Array.from({ length: 5 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
        );
      }

      if (error) {
        return (
            <div className="bg-red-900/20 text-red-300 p-6 rounded-lg text-center">
                <h2 className="text-xl font-bold mb-2">Failed to Load Feed</h2>
                <p className="mb-4">{error}</p>
                <p className="text-sm text-red-200">Please check that the URL is correct and points to a valid RSS/Atom feed. Some feeds may be temporarily unavailable or block requests.</p>
            </div>
        );
      }

      if (channel) {
        return (
            <div>
                <div className="border-b border-green-400/20 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-green-300">{channel.title}</h2>
                        <p className="text-gray-400 mt-1">{channel.description}</p>
                    </div>
                    <button onClick={() => loadFeed(currentUrl)} title="Refresh feed" className="text-gray-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-gray-800 self-start sm:self-center flex-shrink-0">
                        <RefreshIcon className="w-6 h-6" />
                    </button>
                </div>

                <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
                    {articles.length > 0 ? (
                        articles.map(article => (
                            <motion.div 
                                key={article.guid || article.link} 
                                variants={itemVariants} 
                                onClick={() => handleArticleClick(article)} 
                                className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-green-400/50 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-green-500/10 transform hover:-translate-y-1 flex gap-4 overflow-hidden"
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && handleArticleClick(article)}
                            >
                                {article.thumbnail ? (
                                    <img src={article.thumbnail} alt="" className="w-32 h-24 sm:w-40 sm:h-28 object-cover rounded-md flex-shrink-0 bg-gray-800" loading="lazy" />
                                ) : (
                                    <div className="w-32 h-24 sm:w-40 sm:h-28 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-green-300 transition-colors mb-1 line-clamp-2" title={article.title}>{article.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{new Date(article.pubDate).toLocaleString()}</p>
                                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{article.description}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">Feed Empty</h2>
                            <p>This feed was loaded successfully but contains no articles.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
      }

      return null;
    }
    
    return (
        <>
            <MetaTags
                title="RSS Feed Reader | Seedream ImagenBrainAi 4.0"
                description="Read and summarize any RSS feed with our AI-powered reader. Stay updated with the latest news and articles."
                canonicalPath="/feed-reader"
            />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                            AI-Powered RSS Reader
                        </span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        Enter any RSS feed URL to read and summarize articles with Gemini.
                    </p>
                </div>

                <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4 mb-8">
                    <input
                        type="url"
                        value={feedUrl}
                        onChange={(e) => setFeedUrl(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors flex-grow"
                        placeholder="Enter RSS feed URL"
                        aria-label="RSS Feed URL"
                        required
                    />
                    <div className="sm:w-48 flex-shrink-0">
                      <Button type="submit" disabled={isLoading}>
                           {isLoading ? 'Loading...' : 'Load Feed'}
                      </Button>
                    </div>
                </form>

                {renderContent()}
            </div>
        </>
    );
};

export default FeedReaderPage;