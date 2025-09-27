import React, { useState, useEffect } from 'react';
import MetaTags from '../components/MetaTags';
import { apiGetImageHistory, ImageRecord } from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import DownloadIcon from '../components/ui/DownloadIcon';
import { downloadImage } from '../services/generationService';
import { useAuth } from '../hooks/useAuth';

const ImageHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<ImageRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                // Don't fetch if user is not logged in.
                setIsLoading(false);
                return;
            }
            try {
                const token = await user.getIdToken();
                const userHistory = await apiGetImageHistory(token);
                setHistory(userHistory);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load image history.');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (!authLoading) {
            fetchHistory();
        }

    }, [user, authLoading]);

    const renderContent = () => {
        if (isLoading || authLoading) {
            return <div className="flex justify-center py-20"><Spinner /></div>;
        }
        
        if (!user) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
                    <p>You need to be logged in to view your private image gallery.</p>
                    <Link to="/" className="mt-4 inline-block bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                        Back to Generator
                    </Link>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-400 py-20 bg-red-900/20 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Error Loading History</h2>
                    <p>{error}</p>
                </div>
            );
        }

        if (history.length === 0) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-bold mb-2">Your Private Gallery is Empty</h2>
                    <p>Images you generate will appear here. Your gallery holds your 30 most recent creations.</p>
                    <Link to="/" className="mt-4 inline-block bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                        Start Creating
                    </Link>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                    <div key={item.id} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700/50 flex flex-col">
                        <img src={item.url} alt={item.prompt} className="aspect-square w-full object-cover" loading="lazy" />
                        <div className="p-4 border-t border-gray-700">
                             <p className="text-white text-sm font-semibold line-clamp-2 h-10">{item.prompt}</p>
                             <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-400">
                                    Created: {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                                <button 
                                    onClick={() => downloadImage(item.url, item.prompt)} 
                                    className="text-gray-400 hover:text-green-300 transition-colors p-1.5 rounded-full bg-gray-800" 
                                    title="Download as PNG">
                                    <DownloadIcon className="w-5 h-5" />
                                </button>
                             </div>
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
                            Your Private Image History
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
                        This gallery contains your 30 most recent creations. When you generate a new image, the oldest is automatically listed on the Marketplace.
                    </p>
                </div>
                {renderContent()}
            </div>
        </>
    );
};

export default ImageHistoryPage;