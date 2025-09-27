import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivatedLicense, isLicenseExpired } from '../services/licenseService';
import CloseIcon from './ui/CloseIcon';
import { Link } from 'react-router-dom';

interface PlanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenses: ActivatedLicense[];
}

const PlanHistoryModal: React.FC<PlanHistoryModalProps> = ({ isOpen, onClose, licenses }) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const maskKey = (key: string) => {
    if (key.length < 12) return '****';
    return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
  }

  // Ensure licenses are sorted with the most recent first
  const sortedLicenses = [...licenses].sort((a, b) => new Date(b.activationDate).getTime() - new Date(a.activationDate).getTime());

  const handlePurchaseClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-900 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/10 w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="p-8">
                <h2 className="text-2xl font-bold text-center mb-2 text-green-300">Plan Activation History</h2>
                <p className="text-center text-gray-400 mb-6 text-sm">This is a record of your purchased credit packs. Your credits never expire. Purchase a new pack anytime to add more credits.</p>
                
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                  {sortedLicenses.length > 0 ? (
                    <div className="space-y-4">
                      {sortedLicenses.map((license) => {
                        const expired = isLicenseExpired(license);
                        return (
                          <div key={license.key} className={`p-4 rounded-lg border ${expired ? 'bg-gray-800/50 border-gray-700' : 'bg-green-900/20 border-green-400/30'}`}>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <h3 className={`text-lg font-bold ${expired ? 'text-gray-400' : 'text-green-300'}`}>{license.planName}</h3>
                                    <p className="text-xs text-gray-500 font-mono" title={license.key}>{maskKey(license.key)}</p>
                                </div>
                                <div className={`text-sm font-semibold px-3 py-1 rounded-full text-center ${expired ? 'bg-gray-700 text-gray-300' : 'bg-green-400/20 text-green-200'}`}>
                                    {expired ? 'License Expired' : 'License Active'}
                                </div>
                             </div>
                             <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-400 border-t border-gray-700 pt-3">
                                <div>
                                    <p className="font-bold text-gray-300">Credits Added</p>
                                    <p>{license.creditsAdded.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-300">Activated</p>
                                    <p>{formatDate(license.activationDate)}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-300">License Expires</p>
                                    <p>{formatDate(license.expiresAt)}</p>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">You have not activated any plans yet.</p>
                    </div>
                  )}
                </div>
                 <div className="mt-6 text-center">
                    <Link 
                        to="/#pricing" 
                        onClick={handlePurchaseClick}
                        className="inline-block bg-green-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400"
                    >
                        Purchase More Credits
                    </Link>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanHistoryModal;