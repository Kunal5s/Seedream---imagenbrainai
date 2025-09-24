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

// Define types locally as services are removed
interface LicenseStatus {
  name: string | null;
  plan: 'Free Trial';
  credits: number;
  email: string | null;
  subscriptionStatus: 'free_trial' | null;
}

const ANONYMOUS_USER_KEY = 'anonymousUserStatus';
const FREE_TRIAL_CREDITS = 500;

const getAnonymousStatus = (): LicenseStatus => {
    try {
        const storedStatus = localStorage.getItem(ANONYMOUS_USER_KEY);
        if (storedStatus) {
            const parsed = JSON.parse(storedStatus);
            // Ensure the structure is correct, especially plan name
            return {
                ...parsed,
                plan: 'Free Trial',
                subscriptionStatus: 'free_trial'
            };
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

  const [currentUserStatus, setCurrentUserStatus] = useState(getAnonymousStatus());

  const creditsPerImage = PLAN_DETAILS['FREE_TRIAL'].creditsPerImage;

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
  
  const deductCredits = (amount: number) => {
      const creditCost = amount * creditsPerImage;
      const newCredits = currentUserStatus.credits - creditCost;
      const newStatus = {...currentUserStatus, credits: newCredits};
      localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(newStatus));
      setCurrentUserStatus(newStatus);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setGlobalError('Please enter a prompt to generate an image.');
      return;
    }
    
    const creditCost = numberOfImages * creditsPerImage;
    if (currentUserStatus.credits < creditCost) {
      setGlobalError(`Not enough credits. You have ${currentUserStatus.credits}. Visit our Pricing section to see available plans.`);
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);
    cancelGeneration.current = false;
    
    setImages(images.map(img => ({ ...img, status: 'loading', src: null, error: null })));

    try {
      deductCredits(numberOfImages);

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
    
    try {
        deductCredits(1);
        const finalPrompt = constructFinalPrompt();
        const imageUrls = await generatePollinationsImages(finalPrompt, aspectRatio.aspectRatio, 1);
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, status: 'success', src: imageUrls[0], key: Date.now() + i } : img
        ));
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to regenerate image.';
        setImages(prev => prev.map((img, i) => i === index ? { ...img, status: 'error', error: errorMsg } : img));
    }
  };

  const handleDownload = (imageUrl: string) => {
    downloadImage(imageUrl, prompt, 'png');
  };
  
  const creditsNeeded = numberOfImages * creditsPerImage;
  const hasEnoughCredits = currentUserStatus.credits >= creditsNeeded;

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400">Welcome, Guest!</p>
                <span className="font-semibold text-green-300">Plan:</span>
                <span className="ml-2 text-gray-300">{currentUserStatus.plan}</span>
            </div>
            <div className="text-center sm:text-left">
                <span className="font-semibold text-green-300">Credits:</span>
                <span className="ml-2 text-gray-300">{currentUserStatus.credits}</span>
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
        <Button onClick={isGenerating ? handleStop : handleGenerate} disabled={!prompt || !hasEnoughCredits}>
            {isGenerating ? 'Stop Generating' : `Generate Images (${creditsNeeded} Credits)`}
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
                      onClick={() => handleDownload(image.src!)} 
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