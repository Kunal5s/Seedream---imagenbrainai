import React from 'react';
import PremiumPollinationGenerator from './PremiumPollinationGenerator';

const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

const PremiumSuite: React.FC = () => {
  return (
    <div id="premium-suite" className="bg-black/30 border border-yellow-400/30 rounded-lg shadow-2xl shadow-yellow-500/10">
      <div className="px-6 border-b border-yellow-400/30 flex items-center">
        <div className="py-3 px-4 font-semibold text-lg text-yellow-300 border-b-2 border-yellow-300 flex items-center gap-2">
          <StarIcon />
          Pollination Unlimited 
          <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded-full">FREE (FOR NOW)</span>
        </div>
      </div>
      <div className="p-4 md:p-8">
        <p className="text-center text-yellow-200 bg-yellow-900/30 p-3 rounded-lg mb-6 text-sm">
          This advanced tool is currently free for all users. It will become a premium feature for paid plans next week.
        </p>
        <PremiumPollinationGenerator />
      </div>
    </div>
  );
};

export default PremiumSuite;