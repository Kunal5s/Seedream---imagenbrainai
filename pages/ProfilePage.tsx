import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import MetaTags from '../components/MetaTags';
import LicenseModal from '../components/LicenseModal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { downloadImage } from '../services/geminiService';
import DownloadIcon from '../components/ui/DownloadIcon';
import * as ReactRouterDom from 'react-router-dom';


interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


const ProfilePage: React.FC = () => {
    const { user, token, logout } = useAuth();
    const navigate = ReactRouterDom.useNavigate();
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const fetchImageHistory = useCallback(async () => {
        if (!token) return;
        setIsLoadingHistory(true);
        setHistoryError(null);
        try {
            const response = await fetch('/api/images', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch image history.');
            const data = await response.json();
            setImageHistory(data);
        } catch (err) {
            setHistoryError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingHistory(false);
        }
    }, [token]);

    useEffect(() => {
        fetchImageHistory();
    }, [fetchImageHistory]);
    
    const handleDeleteImage = async (imageId: string, imageUrl: string) => {
        if (!token || !window.confirm("Are you sure you want to permanently delete this image? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch('/api/images?action=delete', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ imageId, imageUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete image.');
            }
            // Remove the deleted image from the local state for an instant UI update
            setImageHistory(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred while deleting the image.');
        }
    };
    
     const handleRenewPlan = () => {
        navigate('/');
        // After navigation, HomePage can be modified to scroll to a #pricing section if needed
    };

    if (!user) {
        return null; // ProtectedRoute handles this
    }

    const getStatusChipClass = (status: string | null | undefined) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-300';
            case 'expired': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };
    
    const statusText = user.subscriptionStatus?.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A';

    return (
        <>
            <MetaTags title="Your Profile | Seedream ImagenBrainAi" description="Manage your account details and plan." canonicalPath="/profile" />
             <LicenseModal 
                show={isLicenseModalOpen}
                onClose={() => setIsLicenseModalOpen(false)}
            />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                           Welcome, {user.name || 'Creator'}!
                        </span>
                    </h1>
                    <p className="text-gray-400">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Account Details */}
                    <div className="lg:col-span-1">
                         <h2 className="text-2xl font-bold text-green-300 mb-4">Account Details</h2>
                         <div className="bg-gray-900/50 border border-green-400/20 rounded-lg shadow-lg p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-300">Current Plan:</span>
                                <span className="font-bold text-lg text-green-300 px-3 py-1 bg-green-900/50 rounded-full">{user.plan}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-300">Plan Status:</span>
                                <span className={`font-bold text-sm px-3 py-1 rounded-full ${getStatusChipClass(user.subscriptionStatus)}`}>
                                    {statusText}
                                </span>
                            </div>
                             {user.planExpiryDate && (
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-300">Plan Expires On:</span>
                                    <span className="font-medium text-gray-300">{new Date(user.planExpiryDate).toLocaleDateString()}</span>
                                </div>
                             )}
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-300">Remaining Credits:</span>
                                <span className="font-bold text-lg text-green-300">{user.credits}</span>
                            </div>
                        </div>
                        {user.subscriptionStatus === 'expired' && (
                            <div className="mt-6 p-4 text-center bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                                <p className="font-semibold text-yellow-300">Your plan has expired.</p>
                                <p className="text-sm text-yellow-400">Please renew to continue creating.</p>
                            </div>
                        )}
                        <div className="mt-8 flex flex-col gap-4">
                            <Button onClick={handleRenewPlan} variant="primary">Renew / Purchase Plan</Button>
                            <Button onClick={() => setIsLicenseModalOpen(true)} variant="secondary">Activate a Key</Button>
                            <Button onClick={logout} variant="secondary">Logout</Button>
                        </div>
                    </div>
                    
                    {/* Right Column: Image History */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-green-300 mb-4">Image History ({imageHistory.length})</h2>
                        <div className="bg-gray-900/50 border border-green-400/20 rounded-lg shadow-lg p-6 min-h-[300px]">
                            {isLoadingHistory ? <div className="flex justify-center items-center h-48"><Spinner /></div> :
                             historyError ? <p className="text-red-400 text-center">{historyError}</p> :
                             imageHistory.length === 0 ? <p className="text-gray-500 text-center py-16">You haven't saved any images yet. Go create something amazing!</p> :
                             (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto pr-2">
                                    {imageHistory.map(img => (
                                        <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                                            <img src={img.imageUrl} alt={img.prompt} className="w-full h-full object-cover"/>
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => downloadImage(img.imageUrl, img.prompt, 'png')} className="p-1.5 bg-black/50 rounded-full hover:bg-green-500 transition-colors" title="Download"><DownloadIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteImage(img.id, img.imageUrl)} className="p-1.5 bg-black/50 rounded-full hover:bg-red-500 transition-colors" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                                <p className="text-xs line-clamp-3">{img.prompt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;