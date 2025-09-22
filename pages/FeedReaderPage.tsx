import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import MetaTags from '../components/MetaTags';
import { RssChannel, Article } from '../data/rssData';
import { fetchAndParseRssFeed } from '../services/rssService';
import Spinner from '../components/ui/Spinner';
import RefreshIcon from '../components/ui/RefreshIcon';
import ArticleCardSkeleton from '../components/ArticleCardSkeleton';
import ArticleDetailView from '../components/ArticleDetailView';

const DEFAULT_FEED_URL = 'https://www.imagenbrainai.in/feeds/posts/default?alt=rss';
const ARTICLES_PER_PAGE = 25;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: 'easeOut',
      duration: 0.4,
    },
  },
};

const FeedReaderPage: React.FC = () => {
    const params = ReactRouterDom.useParams<{ guid?: string }>();
    const navigate = ReactRouterDom.useNavigate();

    const [feedUrl, setFeedUrl] = useState<string>(DEFAULT_FEED_URL);
    const [submittedUrl, setSubmittedUrl] = useState<string>(DEFAULT_FEED_URL);
    const [channel, setChannel] = useState<RssChannel | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isPolling, setIsPolling] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [startIndex, setStartIndex] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastArticleElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading || isLoadingMore || !hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreArticles();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isLoadingMore, hasMore]);

    const loadFeed = useCallback(async (url: string, isRefresh = false) => {
        if (!isRefresh) {
            setIsLoading(true);
            setArticles([]);
            setChannel(null);
            setStartIndex(1);
            setHasMore(true);
        }
        setError(null);
        try {
            const { channel: fetchedChannel, articles: fetchedArticles } = await fetchAndParseRssFeed(url, 1, ARTICLES_PER_PAGE);
            setChannel(fetchedChannel);
            setArticles(fetchedArticles);
            setHasMore(fetchedArticles.length === ARTICLES_PER_PAGE);
            setStartIndex(ARTICLES_PER_PAGE + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setChannel(null);
            setArticles([]);
        } finally {
            if (!isRefresh) setIsLoading(false);
        }
    }, []);

    const loadMoreArticles = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const { articles: newArticles } = await fetchAndParseRssFeed(submittedUrl, startIndex, ARTICLES_PER_PAGE);
            setArticles(prev => [...prev, ...newArticles]);
            setHasMore(newArticles.length === ARTICLES_PER_PAGE);
            setStartIndex(prev => prev + ARTICLES_PER_PAGE);
        } catch (err) {
            // Don't show a big error, just stop loading more
            setHasMore(false);
            console.error("Failed to load more articles:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [submittedUrl, startIndex, isLoadingMore, hasMore]);

    // Initial load
    useEffect(() => {
        loadFeed(submittedUrl);
    }, [submittedUrl, loadFeed]);
    
    // Polling for new articles
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            if (isPolling || !submittedUrl || document.hidden) return; // Don't poll if tab is not active
            setIsPolling(true);
            try {
                const { articles: latestArticles } = await fetchAndParseRssFeed(submittedUrl, 1, 5); // check first 5 for new
                setArticles(prevArticles => {
                    const existingGuids = new Set(prevArticles.map(a => a.guid));
                    const newArticles = latestArticles.filter(a => !existingGuids.has(a.guid));
                    if (newArticles.length > 0) {
                        return [...newArticles.map(a => ({...a, isNew: true})), ...prevArticles];
                    }
                    return prevArticles;
                });
            } catch (error) {
                console.error("Error polling for new articles:", error);
            } finally {
                setIsPolling(false);
            }
        }, 60000); // Poll every 60 seconds
        return () => clearInterval(pollInterval);
    }, [submittedUrl, isPolling]);

    // Background fetching for older articles
    useEffect(() => {
         const backgroundFetchInterval = setInterval(() => {
            if (!document.hidden && hasMore && !isLoadingMore) { // only fetch if tab is active, there are more articles, and not already loading
                loadMoreArticles();
            }
        }, 300000); // every 5 minutes

        return () => clearInterval(backgroundFetchInterval);
    }, [hasMore, isLoadingMore, loadMoreArticles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUrl = feedUrl.trim();
        if (trimmedUrl && trimmedUrl !== submittedUrl) {
            setSubmittedUrl(trimmedUrl);
        }
    };
    
    const selectedArticle = useMemo(() => {
        if (!params.guid || articles.length === 0) return null;
        const decodedGuid = decodeURIComponent(params.guid);
        return articles.find(a => a.guid === decodedGuid);
    }, [params.guid, articles]);

    const handleSelectArticle = (guid: string) => {
        navigate(`/feed-reader/article/${encodeURIComponent(guid)}`);
        window.scrollTo(0, 0);
    };
    
    const handleBack = () => {
        navigate('/feed-reader');
    };

    const renderArticleList = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {articles.map((article, index) => (
                <motion.div
                    key={article.guid}
                    variants={itemVariants}
                    ref={index === articles.length - 1 ? lastArticleElementRef : null}
                >
                    <button 
                        onClick={() => handleSelectArticle(article.guid)}
                        className="w-full text-left bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-green-400/50 transition-all duration-300 flex gap-4 items-start group relative"
                    >
                        {article.isNew && (
                             <span className="absolute top-2 right-2 text-xs bg-green-500 text-black font-bold px-2 py-0.5 rounded-full animate-pulse">New</span>
                        )}
                        {article.thumbnail && (
                            <div className="w-24 h-24 sm:w-32 sm:h-24 bg-gray-800 rounded-md flex-shrink-0 overflow-hidden">
                                <img src={article.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        )}
                        <div className="flex-grow">
                            <span className="text-xs text-gray-500">{new Date(article.pubDate).toLocaleString()}</span>
                            <h3 className="text-lg font-semibold text-gray-200 group-hover:text-green-300 transition-colors mt-1">{article.title}</h3>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{article.description}</p>
                        </div>
                    </button>
                </motion.div>
            ))}
        </motion.div>
    );
    
    if (selectedArticle) {
        return (
            <>
                <MetaTags title={`${selectedArticle.title} | Feed Reader`} description={selectedArticle.description} canonicalPath={`/feed-reader/article/${params.guid}`} />
                <ArticleDetailView article={selectedArticle} allArticles={articles} onBack={handleBack} onInternalLinkClick={handleSelectArticle} />
            </>
        )
    }

    return (
        <>
            <MetaTags title="RSS Feed Reader | Seedream ImagenBrainAi 4.0" description="Stay updated with the latest news and articles from top tech and creative sources." canonicalPath="/feed-reader" />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                            AI-Powered RSS Reader
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                        Enter any RSS feed URL to read articles. The feed will auto-refresh with new content.
                    </p>
                </div>

                <div className="bg-gray-900/50 border border-green-400/10 rounded-lg p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-gray-700">
                         <input
                            type="url"
                            value={feedUrl}
                            onChange={(e) => setFeedUrl(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                            placeholder="https://example.com/feed.xml"
                            aria-label="RSS Feed URL"
                            required
                        />
                         <button type="submit" disabled={isLoading} className="bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-colors hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0">
                             {isLoading ? 'Loading...' : 'Load Feed'}
                         </button>
                    </form>
                    
                    {isLoading && (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                        </div>
                    )}
                    
                    {error && !isLoading && (
                        <div className="text-center text-red-400 py-12 bg-red-900/20 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">Failed to Load Feed</h2>
                            <p className="text-sm max-w-md mx-auto">{error}</p>
                            <p className="text-xs text-gray-500 mt-4">Please check that the URL is correct and points to a valid RSS/Atom feed. Some feeds may be temporarily unavailable or block requests.</p>
                        </div>
                    )}
                    
                    {!isLoading && !error && articles.length > 0 && channel && (
                        <div>
                             <h2 className="text-2xl font-bold text-gray-100 mb-1">{channel.title}</h2>
                             <p className="text-gray-400 mb-6">{channel.description}</p>
                             {renderArticleList()}
                        </div>
                    )}

                    {isLoadingMore && (
                        <div className="flex justify-center py-8">
                             <Spinner />
                        </div>
                    )}

                    {!isLoading && !error && articles.length === 0 && (
                         <div className="text-center text-gray-500 py-12">
                             <h2 className="text-xl font-bold mb-2">No Articles Found</h2>
                             <p className="text-sm">The feed appears to be empty or could not be loaded.</p>
                         </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FeedReaderPage;