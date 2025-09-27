import React, { useState, useEffect } from 'react';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { apiGetPollinationsBundles, PollinationBundle } from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);


const PollinationsMarketplacePage: React.FC = () => {
    const [bundles, setBundles] = useState<PollinationBundle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { cart, addToCart } = useCart();

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const fetchedBundles = await apiGetPollinationsBundles();
                const sorted = fetchedBundles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBundles(sorted);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load marketplace bundles.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBundles();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center py-20"><Spinner /></div>;
        }

        if (error) {
            return (
                <div className="text-center text-red-400 py-20 bg-red-900/20 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Error Loading Marketplace</h2>
                    <p>{error}</p>
                </div>
            );
        }
        
        if (bundles.length === 0) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-bold mb-2">Today's Bundles Are Being Generated!</h2>
                    <p>The daily curated art bundles are created fresh every day. Please check back in a few minutes.</p>
                     <Link to="/" className="mt-4 inline-block bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                        Back to the Generator
                    </Link>
                </div>
            );
        }

        return (
             <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {bundles.map((bundle) => {
                const isInCart = cart.some(item => item.id === bundle.id);
                return (
                    <motion.div 
                    key={bundle.id}
                    variants={itemVariants}
                    className="bg-gray-900 border border-yellow-400/20 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-yellow-400/20 flex flex-col"
                    >
                    <div className="grid grid-cols-2 grid-rows-2 aspect-square w-full overflow-hidden">
                        {bundle.imageUrls.slice(0, 4).map((url, index) => (
                            <img 
                                key={index}
                                src={url} 
                                alt={`${bundle.title} - preview ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ))}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-md font-bold text-yellow-300 mb-2 h-12 line-clamp-2">{bundle.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-3 flex-grow">{bundle.description}</p>
                        <p className="text-center text-xs text-gray-500 my-2">10 Images, Multiple Aspect Ratios</p>
                        <div className="mt-2 flex justify-between items-center pt-3 border-t border-yellow-400/10">
                            <p className="text-2xl font-semibold text-white">${(bundle.price / 100).toFixed(2)}</p>
                            <button
                                onClick={() => addToCart(bundle)}
                                disabled={isInCart}
                                className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 text-sm flex items-center gap-2 ${
                                    isInCart
                                    ? 'bg-green-700 text-green-200 cursor-not-allowed focus:ring-green-400/50'
                                    : 'bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-yellow-400/50'
                                }`}
                            >
                                {isInCart ? <><CheckIcon /> Added</> : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                    </motion.div>
                )
              })}
            </motion.div>
        );
    };

  return (
    <>
      <MetaTags
        title="Pollinations Market | Seedream ImagenBrainAi"
        description="Explore daily curated bundles of unique, AI-generated digital artworks from the Pollination AI models. Find your next masterpiece in the Seedream Marketplace."
        canonicalPath="/pollinations-marketplace"
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                Pollinations Art Market
                </span>
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
            A fresh collection of 20 AI-generated art bundles, created automatically every day for you to discover and collect.
          </p>
        </div>
        {renderContent()}
      </div>
    </>
  );
};

export default PollinationsMarketplacePage;