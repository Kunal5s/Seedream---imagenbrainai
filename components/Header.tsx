import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { AnimatePresence, motion } from 'framer-motion';
import { apiCreateCheckoutSession } from '../services/apiService';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const Header: React.FC = () => {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError('');
    try {
        const bundleIds = cart.map(item => item.id);
        const { checkoutUrl } = await apiCreateCheckoutSession(bundleIds);
        window.location.href = checkoutUrl;
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
        setIsCheckingOut(false);
    }
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
        <div className="relative" ref={cartRef}>
            <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative text-gray-300 hover:text-green-300 transition-colors p-2">
                <CartIcon />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-black text-xs font-bold">
                        {cart.length}
                    </span>
                )}
            </button>
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-900 border border-yellow-400/20 rounded-lg shadow-lg z-50"
                    >
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-yellow-300 mb-4">Your Cart</h3>
                            {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded-md mb-2">{error}</p>}
                            {cart.length === 0 ? (
                                <p className="text-gray-400">Your cart is empty.</p>
                            ) : (
                                <>
                                    <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300 truncate pr-2">{item.title}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">${(item.price / 100).toFixed(2)}</span>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300"><TrashIcon /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-yellow-400/20 mt-4 pt-4">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span className="text-white">Total</span>
                                            <span className="text-yellow-300">${getTotalPrice().toFixed(2)}</span>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut}
                                            className="w-full mt-4 bg-yellow-500 text-black font-bold py-2 rounded-lg hover:bg-yellow-400 disabled:bg-gray-600"
                                        >
                                            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                                        </button>
                                         <button onClick={clearCart} className="w-full text-center text-xs text-gray-500 hover:text-red-400 mt-2">Clear Cart</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;