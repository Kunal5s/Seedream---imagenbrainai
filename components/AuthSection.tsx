import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as ReactRouterDom from 'react-router-dom';
import LicenseModal from './LicenseModal';

const AuthSection: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center">
        <p className="text-gray-400 animate-pulse">Loading User Account...</p>
      </div>
    );
  }
  
  if (user) {
    return (
      <>
        <LicenseModal 
          show={isLicenseModalOpen}
          onClose={() => setIsLicenseModalOpen(false)}
        />
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-400">{user.email}</p>
            <span className="font-semibold text-green-300">Plan:</span>
            <span className="ml-2 text-gray-300">{user.plan || '...'}</span>
          </div>
          <div className="text-center sm:text-left">
              <span className="font-semibold text-green-300">Credits:</span>
              <span className="ml-2 text-gray-300">{user.credits ?? '...'}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
                onClick={() => setIsLicenseModalOpen(true)}
                className="flex-1 bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-green-500 hover:text-black"
              >
                Activate License
              </button>
              <button 
                onClick={logout}
                className="flex-1 sm:flex-initial bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-red-500 hover:text-black"
              >
                Logout
              </button>
          </div>
        </div>
      </>
    );
  }
  
  return null;
};

export default AuthSection;