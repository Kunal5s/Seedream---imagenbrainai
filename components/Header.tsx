
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-black/30 backdrop-blur-md sticky top-0 z-50 border-b border-green-400/20">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="text-2xl md:text-3xl font-bold tracking-wider">
          <span className="text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">Seedream</span>
          <span className="text-gray-300"> ImagenBrainAi 4.0</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;