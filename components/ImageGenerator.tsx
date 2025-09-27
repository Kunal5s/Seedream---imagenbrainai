import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadImage } from '../services/generationService';
import { apiSaveImage } from '../services/apiService';
import { IMAGEN_BRAIN_RATIOS, OPEN_ROUTER_MODELS, CREATIVE_STYLES, MOODS, LIGHTING_STYLES, COLORS } from '../constants';
import { UserStatus, getLicensedUserStatus, getGuestStatus, deductGuestCredits } from '../services/licenseService';
import { PLAN_DETAILS } from '../config/plans';
import Button from './ui/Button';
import Select from './ui/Select';
import MoonLoader from './ui/MoonLoader';
import ImagePlaceholder from './ui/ImagePlaceholder';
import ImageErrorPlaceholder from './ui/ImageErrorPlaceholder';
import SuccessWrapper from './ui/SuccessWrapper';
import RegenerateIcon from './ui/RegenerateIcon';
import DownloadIcon from './ui/DownloadIcon';
import LicenseModal from './LicenseModal';
import PlanHistoryModal from './PlanHistoryModal';
import KeyIcon from './ui/KeyIcon';
import HistoryIcon from './ui/HistoryIcon';
import Spinner from './ui/Spinner';
import GalleryIcon from './ui/GalleryIcon';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface ImageState {
    key: number;
    src: string | null;
    status: 'placeholder' | 'loading' | 'success' | 'error';
    error?: string | null;
}

const LOCAL_STORAGE_KEY = 'seedream_last_generation_premium';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [model, setModel] = useState(OPEN_ROUTER_MODELS[0].id);
    const [style, setStyle] = useState(CREATIVE_STYLES[0]);
    const [aspectRatio, setAspectRatio] = useState(IMAGEN_BRAIN_RATIOS[0]);
    const [mood, setMood] = useState(MOODS[0]);
    const [lighting, setLighting] = useState(LIGHTING_STYLES[0]);
    const [color, setColor] = useState(COLORS[0]);
    const numberOfImages = 2; // Fixed to generate 2 images
    const [isGenerating, setIsGenerating] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [currentUserStatus, setCurrentUserStatus] = useState<UserStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const navigate = useNavigate();
    const abortControllers = useRef<AbortController[]>([]);
    const { user, signOutUser, loading: authLoading } = useAuth();

    const [images, setImages] = useState<ImageState[]>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error("Failed to parse saved images.", e);
            }
        }
        return [];
    });
    
    // FIX: Added auth-aware logic to fetch user status.
    // The previous implementation called `getLicensedUserStatus` without a required token.
    useEffect(() => {
        const fetchStatus = async () => {
            setIsLoadingStatus(true);
            try {
                if (user) {
                    const token = await user.getIdToken();
                    const status = await getLicensedUserStatus(token);
                    setCurrentUserStatus(status);
                } else {
                    const guestStatus = getGuestStatus();
                    setCurrentUserStatus(guestStatus);
                }
            } catch (error) {
                console.error("Failed to fetch user status, falling back to guest.", error);
                const guestStatus = getGuestStatus();
                setCurrentUserStatus(guestStatus);
            } finally {
                setIsLoadingStatus(false);
            }
        };
        
        if (!authLoading) {
            fetchStatus();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (images.length === 0 || images.length !== numberOfImages) {
            setImages(
                Array.from({ length: numberOfImages }, (_, i) => ({
                    key: Date.now() + i, src: null, status: 'placeholder',
                }))
            );
        }
    }, [numberOfImages]);

    const handleLicenseActivationSuccess = (newStatus: UserStatus) => {
        setCurrentUserStatus(newStatus);
    };

    const getFullPrompt = () => [
        prompt,
        style !== 'Photorealistic' ? style : '',
        mood !== 'Neutral' ? `${mood} mood` : '',
        lighting !== 'Neutral' ? `${lighting} lighting` : '',
        color !== 'Default' ? `${color} color scheme` : '',
        negativePrompt ? `avoiding ${negativePrompt}` : ''
    ].filter(Boolean).join(', ');

    const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    const generateSingleImage = async (signal: AbortSignal, isPremiumGeneration: boolean): Promise<{ status: 'success'; url: string } | { status: 'error'; message: string } | { status: 'cancelled' }> => {
        try {
            const fullPrompt = getFullPrompt();
            const { width, height } = aspectRatio;
            const seed = Math.floor(Math.random() * 1000000000);
            const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

            const response = await fetch(pollinationUrl, { signal });
            if (!response.ok) throw new Error(`Image service error: ${response.statusText}`);

            const blob = await response.blob();
            const base64Image = await blobToBase64(blob);
            
            const token = user ? await user.getIdToken() : null;

            // Save to backend and deduct credits if premium
            apiSaveImage(base64Image, prompt, fullPrompt, width, height, isPremiumGeneration, token)
                .then(response => {
                    // For licensed users, the backend response is the source of truth for credits
                    if (isPremiumGeneration) {
                        setCurrentUserStatus(prev => ({ ...prev!, credits: response.credits, isGuest: false }));
                    }
                })
                .catch(err => console.error("Failed to save image:", err));

            return { status: 'success', url: URL.createObjectURL(blob) };
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return { status: 'cancelled' };
            return { status: 'error', message: err instanceof Error ? err.message : 'Unknown generation error.' };
        }
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setGlobalError('Please enter a prompt to generate an image.');
            return;
        }

        if (!currentUserStatus) {
            setGlobalError('User status is not loaded yet. Please wait a moment.');
            return;
        }

        const planKey = Object.keys(PLAN_DETAILS).find(k => PLAN_DETAILS[k].name === currentUserStatus.plan) || 'FREE_TRIAL';
        const creditsPerImage = PLAN_DETAILS[planKey]?.creditsPerImage || 5;
        const creditsNeeded = creditsPerImage * numberOfImages;

        if (currentUserStatus.credits < creditsNeeded) {
            if (user) {
                setGlobalError(`You need ${creditsNeeded} credits, but you only have ${currentUserStatus.credits}. Please purchase a plan.`);
            } else {
                setGlobalError(`You need ${creditsNeeded} credits, but you only have ${currentUserStatus.credits}. Please sign up or purchase a plan.`);
            }
            return;
        }

        setIsGenerating(true);
        setGlobalError(null);
        abortControllers.current = [];

        // For guests, deduct credits immediately from local storage for instant feedback
        if (currentUserStatus.isGuest) {
            const newCredits = deductGuestCredits(creditsNeeded);
            setCurrentUserStatus(prev => ({ ...prev!, credits: newCredits }));
        }

        const initialImages = Array.from({ length: numberOfImages }, (_, i) => ({
            key: Date.now() + i, src: null, status: 'loading' as const, error: null
        }));
        setImages(initialImages);

        const generationPromises = initialImages.map((_, index) => {
            const controller = new AbortController();
            abortControllers.current[index] = controller;
            return generateSingleImage(controller.signal, !currentUserStatus.isGuest);
        });

        const results = await Promise.all(generationPromises);
        
        const newImages = initialImages.map((img, index) => {
            const result = results[index];
            if (result.status === 'success') return { ...img, src: result.url, status: 'success' as const };
            if (result.status === 'error') return { ...img, src: null, status: 'error' as const, error: result.message };
            return img;
        });

        setImages(newImages);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newImages.filter(img => img.status === 'success')));
        setIsGenerating(false);
    };

    const handleStop = () => {
        abortControllers.current.forEach(controller => controller.abort());
        setIsGenerating(false);
        setImages(prev => prev.map(img => img.status === 'loading' ? { ...img, status: 'placeholder' } : img));
    };

    const openAuthModal = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    if (isLoadingStatus || authLoading) {
        return <div className="flex justify-center items-center h-96"><Spinner /></div>;
    }
    
    const plan = PLAN_DETAILS[Object.keys(PLAN_DETAILS).find(k => PLAN_DETAILS[k].name === currentUserStatus?.plan) || 'FREE_TRIAL'];
    const creditsPerImage = plan?.creditsPerImage || 5;
    const generationCost = creditsPerImage * numberOfImages;

    return (
        <div className="space-y-6">
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
            {user && <LicenseModal isOpen={isLicenseModalOpen} onClose={() => setIsLicenseModalOpen(false)} onSuccess={handleLicenseActivationSuccess} />}
            {user && <PlanHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} licenses={currentUserStatus?.licenses || []} />}

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                     {user ? (
                        <p className="font-semibold text-sm truncate" title={user.email || 'User'}>Account: <span className="text-green-300">{user.email}</span></p>
                    ) : (
                        <p className="font-semibold">Status: <span className="text-green-300">Guest</span></p>
                    )}
                    <p className="font-semibold">Plan: <span className="text-green-300">{currentUserStatus?.plan}</span></p>
                    <p className="font-semibold">Credits: <span className="text-green-300">{currentUserStatus?.credits.toLocaleString()}</span></p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                    <button onClick={() => navigate('/history')} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg border border-gray-600/50 hover:bg-white/10"><GalleryIcon className="w-4 h-4" /> Image History</button>
                    {user ? (
                        <>
                             <button onClick={() => setIsLicenseModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-green-300 text-sm font-semibold py-2 px-4 rounded-lg border border-green-400/30 hover:bg-green-400/10"><KeyIcon className="w-4 h-4" /> Activate License</button>
                             <button onClick={() => setIsHistoryModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg border border-gray-600/50 hover:bg-white/10"><HistoryIcon className="w-4 h-4" /> Plan History</button>
                             <button onClick={signOutUser} className="flex-1 bg-red-800/50 text-red-300 text-sm font-semibold py-2 px-4 rounded-lg border border-red-600/50 hover:bg-red-500/20">Sign Out</button>
                        </>
                    ) : (
                         <>
                            <button onClick={() => openAuthModal('login')} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-green-300 text-sm font-semibold py-2 px-4 rounded-lg border border-green-400/30 hover:bg-green-400/10">Sign In</button>
                            <button onClick={() => openAuthModal('signup')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-black text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-400">Sign Up</button>
                         </>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="prompt" className="block text-lg font-medium text-green-300 mb-2">Describe your vision</label>
                <textarea id="prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400" placeholder="e.g., a photorealistic portrait of an astronaut on a neon-lit alien planet" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                    label="AI Model" 
                    value={model} 
                    onChange={setModel} 
                    options={OPEN_ROUTER_MODELS.map(m => m.id)} 
                    displayOptions={OPEN_ROUTER_MODELS.map(m => m.name)} 
                    disabled={true} 
                />
                <Select label="Creative Style" value={style} onChange={setStyle} options={CREATIVE_STYLES} />
                <Select label="Aspect Ratio" value={aspectRatio.name} onChange={(val) => { const r = IMAGEN_BRAIN_RATIOS.find(r => r.name === val); if (r) setAspectRatio(r); }} options={IMAGEN_BRAIN_RATIOS.map(r => r.name)} />
            </div>

            <button 
                onClick={() => setAdvancedOptionsVisible(!advancedOptionsVisible)}
                className="text-green-300 hover:text-green-200 text-sm font-semibold"
            >
                {advancedOptionsVisible ? 'Hide Advanced Options ▼' : 'Show Advanced Options ▲'}
            </button>

            {advancedOptionsVisible && (
                 <div className="space-y-4 pt-4 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select label="Mood" value={mood} onChange={setMood} options={MOODS} />
                        <Select label="Lighting Style" value={lighting} onChange={setLighting} options={LIGHTING_STYLES} />
                        <Select label="Color Scheme" value={color} onChange={setColor} options={COLORS} />
                    </div>
                     <div>
                        <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-400 mb-1">Negative Prompt (Optional)</label>
                        <input id="negative-prompt" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400" placeholder="e.g., blurry, text, watermark" />
                    </div>
                </div>
            )}
            
            <div className="text-center pt-4">
                 {isGenerating ? (
                    <Button onClick={handleStop} variant="secondary">Stop Generating</Button>
                ) : (
                    <Button onClick={handleGenerate} disabled={!prompt || !currentUserStatus || currentUserStatus.credits < generationCost} variant="primary">
                        {`Generate ${numberOfImages} Images (${generationCost} Credits)`}
                    </Button>
                )}
            </div>

            {globalError && !isGenerating && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{globalError}</p>}
      
            <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start justify-center">
                    {images.map((image) => (
                        <div key={image.key} className={`relative group w-full ${aspectRatio.className} bg-gray-900/50 rounded-lg border-2 border-dashed border-green-700/50 flex items-center justify-center`}>
                            {image.status === 'placeholder' && <ImagePlaceholder aspectRatioClass={aspectRatio.className} />}
                            {image.status === 'loading' && <MoonLoader />}
                            {image.status === 'success' && image.src && <SuccessWrapper src={image.src} alt={`Generated image`} />}
                            {image.status === 'error' && <ImageErrorPlaceholder message={image.error || 'An error occurred'} aspectRatioClass={aspectRatio.className} />}
                            {image.status === 'success' && image.src && (
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => {}} className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 disabled:opacity-50" title="Regenerate this image" disabled><RegenerateIcon className="w-5 h-5" /></button>
                                    <button onClick={() => downloadImage(image.src!, prompt)} className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60" title="Download as PNG"><DownloadIcon className="w-5 h-5" /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;