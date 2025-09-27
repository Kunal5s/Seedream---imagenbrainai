// pages/PurchaseSuccessPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import Spinner from '../components/ui/Spinner';
import { apiGetDownloadLinkForOrder } from '../services/apiService';
import { useCart } from '../hooks/useCart';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const PurchaseSuccessPage: React.FC = () => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { clearCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('polar_order_id');

    if (orderId) {
      // Clear the cart on successful purchase
      clearCart();
      
      const fetchLink = async () => {
        try {
          // Poll for the download link, as ZIP creation might take a moment
          let attempts = 0;
          const maxAttempts = 10;
          const interval = setInterval(async () => {
            attempts++;
            const response = await apiGetDownloadLinkForOrder(orderId);
            if (response.downloadUrl) {
              setDownloadUrl(response.downloadUrl);
              setIsLoading(false);
              clearInterval(interval);
            } else if (attempts >= maxAttempts) {
              setError('Could not retrieve download link. Please contact support with your order ID.');
              setIsLoading(false);
              clearInterval(interval);
            }
          }, 3000); // Poll every 3 seconds

        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          setIsLoading(false);
        }
      };

      fetchLink();
    } else {
      setError('No order ID found.');
      setIsLoading(false);
    }
  }, [location, clearCart]);

  return (
    <>
      <MetaTags
        title="Purchase Successful | Seedream ImagenBrainAi"
        description="Your purchase was successful. Download your AI-generated art bundles here."
        canonicalPath="/purchase-success"
      />
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gray-900 border border-green-400/20 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-green-300 mb-4">
            Thank You For Your Purchase!
          </h1>
          <p className="text-gray-400 mb-8">
            Your AI art bundles are ready. Click the button below to download your files as a single ZIP archive.
          </p>
          
          {isLoading && (
            <div className="space-y-4">
                <Spinner />
                <p className="text-yellow-300">Preparing your download... Please wait.</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg">
                <h3 className="font-bold">An Error Occurred</h3>
                <p>{error}</p>
            </div>
          )}

          {downloadUrl && !isLoading && (
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center justify-center bg-green-500 text-black font-bold py-4 px-10 rounded-lg transition-transform duration-300 transform hover:scale-105"
            >
              <DownloadIcon />
              Download Your Art
            </a>
          )}
          
          <div className="mt-12 text-sm">
            <Link to="/pollinations-marketplace" className="text-gray-400 hover:text-green-300 transition-colors">
              &larr; Back to the Marketplace
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseSuccessPage;