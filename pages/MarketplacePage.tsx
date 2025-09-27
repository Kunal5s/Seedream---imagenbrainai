import React, { useState, useEffect } from 'react';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { apiGetMarketplaceItems, ImageRecord } from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MarketplacePage: React.FC = () => {
    const [items, setItems] = useState<ImageRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const marketplaceItems = await apiGetMarketplaceItems();
                setItems(marketplaceItems);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load marketplace items.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
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
        
        if (items.length === 0) {
            return (
                <div className="text-center text-gray-500 py-20">
                    <h2 className="text-2xl font-bold mb-2">Marketplace is Currently Empty</h2>
                    <p>Unique creations by users will appear here for sale. Check back soon!</p>
                     <Link to="/" className="mt-4 inline-block bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105">
                        Create Your Own Art
                    </Link>
                </div>
            );
        }

        return (
             <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  variants={itemVariants}
                  className="bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.title || item.prompt} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-green-300 mb-2 h-14 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-3 flex-grow">{item.description}</p>
                    <div className="mt-4 flex justify-between items-center pt-4 border-t border-green-400/10">
                        <p className="text-xl font-semibold text-white">${item.price}</p>
                        <a 
                            href={item.purchaseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-black font-bold py-2 px-5 rounded-lg transition-all duration-300 transform hover:bg-green-400 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                        >
                            Purchase
                        </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
        );
    };

  return (
    <>
      <MetaTags
        title="Seedream Imagenbrainai Digital Art Marketplace | Seedream ImagenBrainAi"
        description="Explore and purchase unique, AI-generated digital artworks from a community of talented creators. Find your next masterpiece in the Seedream Marketplace."
        canonicalPath="/marketplace"
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Seedream Imagenbrainai Digital Art Marketplace
                </span>
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
            Discover and collect unique AI-generated artworks from our talented community.
          </p>
        </div>
        {renderContent()}
      </div>
    </>
  );
};

export default MarketplacePage;