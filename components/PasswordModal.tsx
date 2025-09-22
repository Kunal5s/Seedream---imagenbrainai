import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

interface PasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPassword?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ show, onClose, onSuccess, correctPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const expectedPassword = correctPassword || process.env.ADMIN_PASSWORD || 'admin';

  useEffect(() => {
    if (show) {
      // Focus the input when the modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when modal closes
      setPassword('');
      setError(null);
    }
  }, [show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === expectedPassword) {
      setError(null);
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="relative bg-gray-900 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/10 w-full max-w-md p-8"
          >
            <h2 id="password-modal-title" className="text-2xl font-bold text-center text-green-300 mb-4">
              Access Required
            </h2>
            <p className="text-center text-gray-400 mb-6">
              This area is protected. Please enter the password to continue.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password-input" className="sr-only">Password</label>
                <input
                  ref={inputRef}
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-center focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary">
                Unlock
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;
