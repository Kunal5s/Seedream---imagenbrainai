import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Features', path: '/features' },
    { name: 'Blog', path: '/blog' },
  ];

  const resourceLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ];

  return (
    <footer className="bg-gray-900 border-t border-green-400/20 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <span className="text-green-300">Seedream</span>
                <span className="text-gray-300"> ImagenBrainAi 4.0</span>
              </Link>
            </h3>
            <p className="text-gray-400 text-sm">
              A next-generation creative suite designed to empower artists, designers, and innovators by transforming imagination into stunning visual reality. We are dedicated to pushing the boundaries of AI art.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:text-center">
            <h4 className="font-semibold text-green-300 tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-green-300 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Resources */}
          <div className="md:text-center">
             <h4 className="font-semibold text-green-300 tracking-wider uppercase mb-4">Resources</h4>
             <ul className="space-y-2">
               {resourceLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-green-300 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
             </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
           © {new Date().getFullYear()} Seedream ImagenBrainAi 4.0. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;