// pages/PurchaseCancelledPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);


const PurchaseCancelledPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Purchase Cancelled | Seedream ImagenBrainAi"
        description="Your purchase was cancelled. Your cart has been saved if you'd like to try again."
        canonicalPath="/purchase-cancelled"
      />
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <AlertIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-300 mb-4">
            Checkout Cancelled
          </h1>
          <p className="text-gray-400 mb-8">
            It looks like you cancelled the purchase. Your items are still in your cart if you'd like to try again.
          </p>
          
          <Link 
            to="/pollinations-marketplace" 
            className="inline-block bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-transform duration-300 transform hover:scale-105"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    </>
  );
};

export default PurchaseCancelledPage;