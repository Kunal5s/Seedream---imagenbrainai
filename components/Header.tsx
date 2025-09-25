import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkStyle = {
    color: '#6EE7B7',
    textShadow: '0 0 5px rgba(110, 231, 183, 0.7)',
  };

  return (
    <header className="bg-black/30 backdrop-blur-md sticky top-0 z-50 border-b border-green-400/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <Link to="/" className="text-2xl md:text-3xl font-bold tracking-wider">
            <span className="text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">Seedream</span>
            <span className="text-gray-300"> ImagenBrainAi</span>
          </Link>
        </div>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <NavLink 
                to="/history" 
                className="text-gray-300 hover:text-green-300 transition-colors font-semibold"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                History
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
