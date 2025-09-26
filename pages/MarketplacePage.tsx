
import React from 'react';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';
import { marketplaceData } from '../data/marketplaceData';

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

  const handlePurchaseClick = (title: string) => {
    alert(`Thank you for your interest in "${title}"! Full purchasing functionality is coming soon.`);
  };

  return (
    <>
      <MetaTags
        title="Digital Art Marketplace | Seedream ImagenBrainAi"
        description="Explore and purchase unique, AI-generated digital artworks from a community of talented creators. Find your next masterpiece in the Seedream Marketplace."
        canonicalPath="/marketplace"
      />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Digital Art Marketplace
                </span>
            </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
            Discover and collect unique AI-generated artworks from our talented community.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {marketplaceData.map((item) => (
            <motion.div 
              key={item.id}
              variants={itemVariants}
              className="bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-green-300">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">by {item.artist}</p>
                <div className="mt-4 flex-grow"></div>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-semibold text-white">{item.price}</p>
                    <button 
                        onClick={() => handlePurchaseClick(item.title)}
                        className="bg-green-500 text-black font-bold py-2 px-5 rounded-lg transition-all duration-300 transform hover:bg-green-400 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                    >
                        Purchase
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default MarketplacePage;