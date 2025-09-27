// hooks/useCart.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PollinationBundle } from '../services/apiService';

interface CartItem extends PollinationBundle {}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: PollinationBundle) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'seedream_pollinations_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: PollinationBundle) => {
    setCart(prevCart => {
      if (prevCart.some(cartItem => cartItem.id === item.id)) {
        return prevCart; // Item already in cart
      }
      return [...prevCart, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0) / 100;
  };

  const value = { cart, addToCart, removeFromCart, clearCart, getTotalPrice };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};