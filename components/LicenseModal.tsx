import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { LicenseStatus, getLicenseStatus, activateLicense } from '../services/licenseService';

interface LicenseModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ show, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LicenseStatus | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      const status = getLicenseStatus();
      setCurrentStatus(status);
      setEmail(status.email || ''); // Pre-fill email if it exists
      setKey('');
      setError(null);
      setSuccessMessage(null);
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !key) {
      setError('Please fill in both email and activation key.');
      return;
    }

    try {
      const newStatus = activateLicense(email, key);
      setCurrentStatus(newStatus);
      setSuccessMessage(`Success! Your ${newStatus.plan} plan is now active with ${newStatus.credits} credits.`);
      onSuccess(); // Notify parent component to update its state
      setTimeout(onClose, 2000); // Close modal after 2 seconds on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="license-modal-title"
            className="relative bg-gray-900 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/10 w-full max-w-md p-8"
          >
            <h2 id="license-modal-title" className="text-2xl font-bold text-center text-green-300 mb-2">
              Manage Your Plan
            </h2>
            <div className="text-center bg-gray-800/50 p-2 rounded-lg mb-6">
                <p className="text-sm text-gray-400">Current Plan: <span className="font-bold text-green-300">{currentStatus?.plan}</span></p>
                <p className="text-sm text-gray-400">Remaining Credits: <span className="font-bold text-green-300">{currentStatus?.credits}</span></p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-400 mb-1">Your Email</label>
                <input
                  ref={emailInputRef}
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
               <div>
                <label htmlFor="key-input" className="block text-sm font-medium text-gray-400 mb-1">Activation Key</label>
                <input
                  id="key-input"
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                  placeholder="Enter the key from your email"
                  required
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center" role="alert">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="text-green-300 text-sm text-center" role="alert">
                  {successMessage}
                </p>
              )}
              <Button type="submit" variant="primary" disabled={!!successMessage}>
                {successMessage ? 'Activated!' : 'Activate Plan'}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LicenseModal;