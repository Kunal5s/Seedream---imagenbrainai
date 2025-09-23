
import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-black/30 backdrop-blur-md sticky top-0 z-50 border-b border-green-400/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <ReactRouterDom.Link to="/" className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-wider">
            <img src="/favicon.svg" alt="Seedream Logo" className="h-10 w-10" />
            <div>
              <span className="text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">Seedream</span>
              <span className="text-gray-300"> ImagenBrainAi</span>
            </div>
          </ReactRouterDom.Link>
        </div>
        {/* Blog link removed as per user request */}
      </div>
    </header>
  );
};

export default Header;