
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';

interface LicenseModalProps {
  show: boolean;
  onClose: () => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ show, onClose }) => {
  const { user, activateLicense } = useAuth();
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      // If user is logged in, pre-fill their email.
      // Otherwise, clear the form for a new activation.
      setEmail(user?.email || '');
      setKey('');
      setError(null);
      setSuccessMessage(null);
      setIsLoading(false);
      
      // Smartly focus the correct input field.
      setTimeout(() => {
        if (user) {
          keyInputRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 100);
    }
  }, [show, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !key) {
      setError('Please fill in both your email and the activation key.');
      return;
    }
    
    setIsLoading(true);
    try {
      const newStatus = await activateLicense(email, key);
      setSuccessMessage(`Success! Your plan is now ${newStatus.plan} with ${newStatus.credits} credits.`);
      // The useAuth hook will automatically update the user state globally.
      setTimeout(onClose, 2500); // Close modal after success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
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
              Activate Your Plan
            </h2>
             <p className="text-center text-gray-400 mb-6">
                Enter the email you used for purchase and your activation key.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-gray-400 mb-1">Your Purchase Email</label>
                <input
                  ref={emailInputRef}
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                  placeholder="you@example.com"
                  required
                  readOnly={!!user} // Make it read-only if logged in
                />
              </div>
               <div>
                <label htmlFor="key-input" className="block text-sm font-medium text-gray-400 mb-1">Activation Key</label>
                <input
                  ref={keyInputRef}
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
              <Button type="submit" variant="primary" disabled={isLoading || !!successMessage}>
                {isLoading ? 'Activating...' : (successMessage ? 'Activated!' : 'Activate Plan')}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LicenseModal;