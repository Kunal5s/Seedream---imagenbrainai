import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activateLicense, UserStatus } from '../services/licenseService';
import Spinner from './ui/Spinner';
import CloseIcon from './ui/CloseIcon';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (status: UserStatus) => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const newStatus = await activateLicense(email, licenseKey);
      const planDetails = newStatus.licenses.find(l => l.key === licenseKey);
      const creditsAdded = planDetails?.creditsAdded || 0;

      setMessage(`Success! Plan activated. ${creditsAdded > 0 ? `${creditsAdded.toLocaleString()} credits have been added.` : ''}`);
      setStatus('success');
      onSuccess(newStatus);
      
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
      setMessage(errorMsg);
      setStatus('error');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setEmail('');
        setLicenseKey('');
        setStatus('idle');
        setMessage('');
    }, 300);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-900 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/10 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="p-8">
                <h2 className="text-2xl font-bold text-center mb-2 text-green-300">Activate Your Plan</h2>
                <p className="text-center text-gray-400 mb-6 text-sm">Enter the email address used at checkout and the license key you received.</p>
                
                {status === 'loading' ? (
                    <div className="min-h-[250px] flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : status === 'success' || status === 'error' ? (
                    <div className={`min-h-[250px] flex flex-col items-center justify-center text-center p-4 rounded-lg ${status === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'}`}>
                        <h3 className="text-xl font-bold mb-2">{status === 'success' ? 'Activation Successful' : 'Activation Failed'}</h3>
                        <p>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                                Purchase Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-400 mb-1">
                                License Key
                            </label>
                            <input
                                type="text"
                                id="licenseKey"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                                placeholder="polar_cl_..."
                            />
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                // FIX: This comparison is invalid because TypeScript narrows the `status` type to 'idle' in this code block.
                                // The button is only rendered when not loading, so it can't be disabled for that reason.
                                disabled={false}
                                className="w-full bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                Activate Plan
                            </button>
                        </div>
                    </form>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LicenseModal;