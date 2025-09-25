import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImages, downloadImage } from '../services/generationService';
import { CREATIVE_STYLES, IMAGEN_BRAIN_RATIOS, MOODS, LIGHTING_STYLES, COLORS, OPEN_ROUTER_MODELS } from '../constants';
import { getLicensedUserStatus, UserStatus, createGuestStatus } from '../services/licenseService';
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

interface ImageState {
    key: number;
    src: string | null;
    status: 'placeholder' | 'loading' | 'success' | 'error';
    error?: string | null;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState(OPEN_ROUTER_MODELS[0].id);
  const [style, setStyle] = useState(CREATIVE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState(IMAGEN_BRAIN_RATIOS[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [lighting, setLighting] = useState(LIGHTING_STYLES[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [numberOfImages, setNumberOfImages] = useState(4);
  
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
  const cancelGeneration = useRef(false);

  // NEW: State is now managed asynchronously
  const [currentUserStatus, setCurrentUserStatus] = useState<UserStatus>(createGuestStatus());
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const navigate = useNavigate();

  // NEW: Fetch user status from backend on initial load
  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      const status = await getLicensedUserStatus();
      setCurrentUserStatus(status);
      setIsLoadingStatus(false);
    };
    fetchStatus();
  }, []);

  const activePlanDetails = Object.values(PLAN_DETAILS).find(p => p.name === currentUserStatus.plan) || PLAN_DETAILS['FREE_TRIAL'];
  const creditsPerImage = activePlanDetails.creditsPerImage;

  useEffect(() => {
    setImages(
      Array.from({ length: numberOfImages }, (_, i) => ({
        key: Date.now() + i,
        src: null,
        status: 'placeholder',
      }))
    );
  }, [numberOfImages]);
  
  const handleLicenseActivationSuccess = (newStatus: UserStatus) => {
      setCurrentUserStatus(newStatus);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setGlobalError('Please enter a prompt to generate an image.');
      return;
    }
    
    const creditsNeeded = numberOfImages * creditsPerImage;
    if (currentUserStatus.credits < creditsNeeded) {
      setGlobalError(`Not enough credits. You have ${currentUserStatus.credits}. Visit our Pricing section or activate a license.`);
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);
    cancelGeneration.current = false;
    
    setImages(images.map(img => ({ ...img, status: 'loading', src: null, error: null })));

    try {
      // NEW: Call the backend generation service with the selected model
      const { imageUrls, credits: updatedCredits } = await generateImages(prompt, negativePrompt, style, aspectRatio.name, mood, lighting, color, numberOfImages, model);
      
      // NEW: Update credit balance from the server's response
      setCurrentUserStatus(prev => ({...prev, credits: updatedCredits }));

      for (let i = 0; i < imageUrls.length; i++) {
        if (cancelGeneration.current) {
            setImages(prev => prev.map(img => img.status === 'loading' ? { ...img, status: 'placeholder' } : img));
            break;
        }
        setImages(prev => prev.map((img, index) => 
            index === i ? { ...img, status: 'success', src: imageUrls[i], key: Date.now() + i } : img
        ));
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred during generation.';
      setGlobalError(errorMsg);
      setImages(images.map(img => ({ ...img, status: 'error', error: errorMsg })));
      // The backend should handle refunding credits on failure, but we can refetch status to be sure.
      const status = await getLicensedUserStatus();
      setCurrentUserStatus(status);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    cancelGeneration.current = true;
    setIsGenerating(false);
  };
  
  const handleRegenerateSingle = async (index: number) => {
    if (currentUserStatus.credits < creditsPerImage) {
      setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: `Not enough credits.` } : img));
      return;
    }
    if (!prompt) {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: 'Cannot regenerate without a prompt.' } : img));
        return;
    }
    setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'loading', src: null, error: null } : img));
    
    try {
        const { imageUrls, credits: updatedCredits } = await generateImages(prompt, negativePrompt, style, aspectRatio.name, mood, lighting, color, 1, model);
        
        setCurrentUserStatus(prev => ({...prev, credits: updatedCredits }));
        
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, status: 'success', src: imageUrls[0], key: Date.now() + i } : img
        ));
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to regenerate image.';
        setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: errorMsg } : img));
        const status = await getLicensedUserStatus();
        setCurrentUserStatus(status);
    }
  };
  
  const creditsNeeded = numberOfImages * creditsPerImage;
  const hasEnoughCredits = currentUserStatus.credits >= creditsNeeded;
  
  if (isLoadingStatus) {
    return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
       <LicenseModal 
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onSuccess={handleLicenseActivationSuccess}
      />
       <PlanHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        licenses={currentUserStatus?.licenses || []}
       />
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div>
                    <p className="text-xs text-gray-400">Welcome, {currentUserStatus?.name || 'Guest'}!</p>
                    <p>
                        <span className="font-semibold text-green-300">Plan:</span>
                        <span className="ml-2 text-gray-300">{currentUserStatus?.plan}</span>
                    </p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">&nbsp;</p>
                    <p>
                        <span className="font-semibold text-green-300">Credits:</span>
                        <span className="ml-2 text-gray-300">{currentUserStatus?.credits.toLocaleString() || 0}</span>
                    </p>
                </div>
            </div>
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                    onClick={() => setIsLicenseModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-green-300 text-sm font-semibold py-2 px-4 rounded-lg border border-green-400/30 transition-all duration-300 transform hover:bg-green-400/10 focus:outline-none focus:ring-2 ring-green-400"
                >
                    <KeyIcon className="w-4 h-4" />
                    Activate License
                </button>
                <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg border border-gray-600/50 transition-all duration-300 transform hover:bg-white/10 focus:outline-none focus:ring-2 ring-gray-400"
                >
                    <HistoryIcon className="w-4 h-4" />
                    View Plan History
                </button>
                <button
                    onClick={() => navigate('/history')}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg border border-gray-600/50 transition-all duration-300 transform hover:bg-white/10 focus:outline-none focus:ring-2 ring-gray-400"
                >
                    <GalleryIcon className="w-4 h-4" />
                    Image History
                </button>
            </div>
        </div>
      <div>
        <label htmlFor="prompt" className="block text-lg font-medium text-green-300 mb-2">
          Describe your vision
        </label>
        <textarea
          id="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
          placeholder="e.g., a photorealistic portrait of an astronaut on a neon-lit alien planet"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-400 mb-1">
            AI Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
          >
            {OPEN_ROUTER_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <Select
          label="Creative Style"
          value={style}
          onChange={setStyle}
          options={CREATIVE_STYLES}
        />
        <div className="flex flex-col">
          <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-gray-400 mb-1">
            Aspect Ratio
          </label>
          <select
            id="aspect-ratio-select"
            value={aspectRatio.name}
            onChange={(e) => {
              const selectedRatio = IMAGEN_BRAIN_RATIOS.find(r => r.name === e.target.value);
              if (selectedRatio) setAspectRatio(selectedRatio);
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
          >
            {IMAGEN_BRAIN_RATIOS.map(ratio => (
              <option key={ratio.name} value={ratio.name}>{ratio.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="number-of-images" className="block text-sm font-medium text-gray-400 mb-1">
            Number of Images
          </label>
          <select
             id="number-of-images"
             value={numberOfImages}
             onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))}
             className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <button 
          onClick={() => setAdvancedOptionsVisible(!advancedOptionsVisible)}
          className="text-green-300 hover:text-green-200 text-sm font-semibold"
        >
          {advancedOptionsVisible ? 'Hide Advanced Options ▼' : 'Show Advanced Options ▲'}
        </button>
      </div>
      
      {advancedOptionsVisible && (
         <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Select label="Mood" value={mood} onChange={setMood} options={MOODS} />
             <Select label="Lighting Style" value={lighting} onChange={setLighting} options={LIGHTING_STYLES} />
             <Select label="Color Scheme" value={color} onChange={setColor} options={COLORS} />
           </div>
           <div>
             <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-400 mb-1">
               Negative Prompt (what to avoid)
             </label>
             <input
               type="text"
               id="negative-prompt"
               value={negativePrompt}
               onChange={(e) => setNegativePrompt(e.target.value)}
               className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
               placeholder="e.g., blurry, text, watermark, ugly"
             />
           </div>
         </div>
      )}
      <div className="text-center">
        <Button onClick={isGenerating ? handleStop : handleGenerate} disabled={!prompt || !hasEnoughCredits || isGenerating}>
            {isGenerating ? 'Stop Generating' : `Generate Images (~${creditsNeeded} Credits)`}
        </Button>
        {!hasEnoughCredits && <p className="text-yellow-400 text-sm mt-2">You need more credits. Please see our pricing plans.</p>}
      </div>


      {globalError && !isGenerating && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{globalError}</p>}
      
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start justify-center">
          {images.map((image, index) => (
            <div key={image.key} className={`relative group w-full ${aspectRatio.className} bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center`}>
              {image.status === 'placeholder' && <ImagePlaceholder aspectRatioClass={aspectRatio.className} />}
              {image.status === 'loading' && <MoonLoader />}
              {image.status === 'success' && image.src && <SuccessWrapper src={image.src} alt={`Generated image ${index + 1}`} />}
              {image.status === 'error' && <ImageErrorPlaceholder message={image.error || 'An error occurred'} aspectRatioClass={aspectRatio.className} />}
              
              {image.status === 'success' && image.src && (
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRegenerateSingle(index)}
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                      title="Regenerate this image">
                      <RegenerateIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => downloadImage(image.src!, prompt)} 
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                      title="Download as PNG">
                      <DownloadIcon className="w-5 h-5" />
                    </button>
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