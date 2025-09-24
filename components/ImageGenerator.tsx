import React, { useState, useEffect, useRef } from 'react';
import { generateImages as generatePollinationsImages, downloadImage } from '../services/pollinationsService';
import { CREATIVE_STYLES, IMAGEN_BRAIN_RATIOS, MOODS, LIGHTING_STYLES, COLORS } from '../constants';
import { PLAN_DETAILS } from '../config/plans';
import Button from './ui/Button';
import Select from './ui/Select';
import MoonLoader from './ui/MoonLoader';
import ImagePlaceholder from './ui/ImagePlaceholder';
import ImageErrorPlaceholder from './ui/ImageErrorPlaceholder';
import SuccessWrapper from './ui/SuccessWrapper';
import RegenerateIcon from './ui/RegenerateIcon';
import DownloadIcon from './ui/DownloadIcon';
import { useAuth } from '../hooks/useAuth';
import type { LicenseStatus } from '../services/kvService';

const ANONYMOUS_USER_KEY = 'anonymousUserStatus';
const FREE_TRIAL_CREDITS = 500;

const getAnonymousStatus = (): LicenseStatus => {
    try {
        const storedStatus = localStorage.getItem(ANONYMOUS_USER_KEY);
        if (storedStatus) {
            return JSON.parse(storedStatus);
        }
    } catch (error) {
        console.error("Could not parse anonymous user status:", error);
    }
    const defaultStatus: LicenseStatus = {
        name: 'Guest',
        plan: 'Free Trial',
        credits: FREE_TRIAL_CREDITS,
        email: null,
        subscriptionStatus: 'free_trial',
    };
    localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(defaultStatus));
    return defaultStatus;
};

interface ImageState {
    key: number;
    src: string | null;
    status: 'placeholder' | 'loading' | 'success' | 'error';
    error?: string | null;
}

const CloudUploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 13.5v-2.25A4.5 4.5 0 017.5 6.75h9a4.5 4.5 0 014.5 4.5v2.25m-16.5 0a4.5 4.5 0 00-1.5 3.75v2.25a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5v-2.25a4.5 4.5 0 00-1.5-3.75m-16.5 0h16.5" />
    </svg>
);

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
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

  const { user, token, deductCredits, refreshUser, isLoading: isAuthLoading } = useAuth();
  const [anonymousUser, setAnonymousUser] = useState(getAnonymousStatus());

  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<number, string | null>>({});

  const currentUserStatus = user || anonymousUser;
  const isUserLoggedIn = !!user;

  const planKey = Object.keys(PLAN_DETAILS).find(k => PLAN_DETAILS[k].planName === currentUserStatus.plan) || 'FREE_TRIAL';
  const creditsPerImage = PLAN_DETAILS[planKey].creditsPerImage;

  useEffect(() => {
    setImages(
      Array.from({ length: numberOfImages }, (_, i) => ({
        key: Date.now() + i,
        src: null,
        status: 'placeholder',
      }))
    );
  }, [numberOfImages]);

  const constructFinalPrompt = () => {
    let finalPrompt = prompt;
    if (style !== 'Photorealistic') finalPrompt += `, ${style} style`;
    if (mood !== 'Neutral') finalPrompt += `, ${mood} mood`;
    if (lighting !== 'Neutral') finalPrompt += `, ${lighting} lighting`;
    if (color !== 'Default') finalPrompt += `, ${color}`;
    if (negativePrompt) finalPrompt += ` --no ${negativePrompt}`;
    return finalPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setGlobalError('Please enter a prompt to generate an image.');
      return;
    }
    
    const creditCost = numberOfImages * creditsPerImage;
    if (currentUserStatus.credits < creditCost) {
      setGlobalError(`Not enough credits. You need ${creditCost} but only have ${currentUserStatus.credits}. Purchase or activate a plan to continue.`);
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);
    cancelGeneration.current = false;
    
    setImages(images.map(img => ({ ...img, status: 'loading', src: null, error: null })));
    setSaveStatus({});
    setIsSaving({});

    try {
      if (isUserLoggedIn) {
        await deductCredits(numberOfImages);
      } else {
        const newCredits = anonymousUser.credits - creditCost;
        const newStatus = {...anonymousUser, credits: newCredits};
        localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(newStatus));
        setAnonymousUser(newStatus);
      }

      const finalPrompt = constructFinalPrompt();
      const imageUrls = await generatePollinationsImages(finalPrompt, aspectRatio.aspectRatio, numberOfImages);
      
      for (let i = 0; i < imageUrls.length; i++) {
        if (cancelGeneration.current) {
            setImages(prev => prev.map(img => img.status === 'loading' ? { ...img, status: 'placeholder' } : img));
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 2500)); 
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
       if (isUserLoggedIn) refreshUser();
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
      setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: `Not enough credits. You have ${currentUserStatus.credits}.` } : img));
      return;
    }
    if (!prompt) {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: 'Cannot regenerate without a prompt.' } : img));
        return;
    }
    setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'loading', src: null, error: null } : img));
    setSaveStatus(prev => ({ ...prev, [index]: null }));
    
    try {
        if (isUserLoggedIn) {
            await deductCredits(1);
        } else {
            const newCredits = anonymousUser.credits - creditsPerImage;
            const newStatus = {...anonymousUser, credits: newCredits};
            localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(newStatus));
            setAnonymousUser(newStatus);
        }

        const finalPrompt = constructFinalPrompt();
        const imageUrls = await generatePollinationsImages(finalPrompt, aspectRatio.aspectRatio, 1);
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, status: 'success', src: imageUrls[0], key: Date.now() + i } : img
        ));
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to regenerate image.';
        setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: errorMsg } : img));
        if (isUserLoggedIn) refreshUser();
    }
  };

  const handleDownload = (imageUrl: string) => {
    downloadImage(imageUrl, prompt, 'png');
  };

  const handleSaveToCloud = async (imageUrl: string, index: number) => {
    if (!isUserLoggedIn || !token) {
        setSaveStatus(prev => ({...prev, [index]: 'Error: Please log in to save images.'}));
        return;
    }
    setIsSaving(prev => ({ ...prev, [index]: true }));
    setSaveStatus(prev => ({ ...prev, [index]: null }));
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image for saving.');

      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
            const saveResponse = await fetch('/api/images?action=upload', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ imageData: base64data, prompt: constructFinalPrompt() }),
            });

            if (!saveResponse.ok) {
                const errorResult = await saveResponse.json();
                throw new Error(errorResult.message || 'Failed to save the image to the cloud.');
            }
            setSaveStatus(prev => ({ ...prev, [index]: `Saved to profile!` }));
        } catch (apiError) {
             setSaveStatus(prev => ({ ...prev, [index]: `Error: ${apiError instanceof Error ? apiError.message : 'Save failed.'}` }));
        } finally {
            setIsSaving(prev => ({ ...prev, [index]: false }));
        }
      };
      reader.onerror = () => { throw new Error("Failed to read image data.") }
    } catch (error) {
        setSaveStatus(prev => ({ ...prev, [index]: `Error: ${error instanceof Error ? error.message : 'Save failed.'}` }));
        setIsSaving(prev => ({ ...prev, [index]: false }));
    }
  };
  
  const creditsNeeded = numberOfImages * creditsPerImage;
  const hasEnoughCredits = currentUserStatus.credits >= creditsNeeded;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <Button onClick={isGenerating ? handleStop : handleGenerate} disabled={!prompt || isGenerating && !cancelGeneration.current || !hasEnoughCredits && !isAuthLoading}>
            {isGenerating ? 'Stop Generating' : `Generate Images (${creditsNeeded} Credits)`}
        </Button>
        {!hasEnoughCredits && !isAuthLoading && <p className="text-yellow-400 text-sm mt-2">You need more credits. Please purchase or activate a license.</p>}
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
                      onClick={() => handleSaveToCloud(image.src!, index)}
                      disabled={isSaving[index] || !isUserLoggedIn}
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                      title={isUserLoggedIn ? "Save to Cloud" : "Please log in to save"}>
                      <CloudUploadIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleRegenerateSingle(index)}
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                      title="Regenerate this image">
                      <RegenerateIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDownload(image.src!)} 
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                      title="Download as PNG">
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                </div>
              )}
               {saveStatus[index] && (
                    <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm ${saveStatus[index]?.startsWith('Error') ? 'text-red-400' : 'text-green-300'}`}>
                        {isSaving[index] ? 'Saving...' : saveStatus[index]}
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