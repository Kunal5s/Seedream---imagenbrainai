import React, { useState, useEffect } from 'react';
import MetaTags from '../components/MetaTags';
import { apiGetImageHistory, ImageHistoryItem } from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import DownloadIcon from '../components/ui/DownloadIcon';
import { downloadImage } from '../services/generationService';

const ImageHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<ImageHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const userHistory = await apiGetImageHistory();
                setHistory(userHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load image history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center py-20"><Spinner /></div>;
        }

        if (error) {
            return (
                <div className="text-center text-red-400 py-20 bg-red-900/20 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Error Loading History</h2>
                    <p>{error}</p>
                    <p className="mt-2 text-sm">You may need to be logged in to view your history.</p>
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-bold mb-2">No Images Yet</h2>
                    <p>Your generated images will appear here once you create them.</p>
                    <Link to="/" className="mt-4 inline-block bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                        Start Creating
                    </Link>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                    <div key={item.id} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700/50">
                        <img src={item.url} alt={item.prompt} className="aspect-square w-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                            <p className="text-white text-sm font-semibold line-clamp-3">{item.prompt}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                             <button 
                                onClick={() => downloadImage(item.url, item.prompt)} 
                                className="absolute top-2 right-2 text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                                title="Download as PNG">
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <MetaTags
                title="My Image History | Seedream ImagenBrainAi"
                description="Browse your personal gallery of AI-generated images created with Seedream ImagenBrainAi."
                canonicalPath="/history"
            />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-extrabold">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                            Your Image History
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
                        A gallery of your unique creations.
                    </p>
                </div>
                {renderContent()}
            </div>
        </>
    );
};

export default ImageHistoryPage;
