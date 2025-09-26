import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadImage } from '../services/generationService';
import { apiSaveImage } from '../services/apiService';
import { CREATIVE_STYLES, IMAGEN_BRAIN_RATIOS, MOODS, LIGHTING_STYLES, COLORS, OPEN_ROUTER_MODELS } from '../constants';
import { getLicensedUserStatus, UserStatus, createGuestStatus } from '../services/licenseService';
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

const LOCAL_STORAGE_KEY = 'seedream_last_generation_main';

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
  
  const [images, setImages] = useState<ImageState[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse saved images.", e);
        }
    }
    return [];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
  
  const [currentUserStatus, setCurrentUserStatus] = useState<UserStatus>(createGuestStatus());
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const navigate = useNavigate();

  const abortControllers = useRef<AbortController[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      const status = await getLicensedUserStatus();
      setCurrentUserStatus(status);
      setIsLoadingStatus(false);
    };
    fetchStatus();
  }, []);
  
  useEffect(() => {
    if (images.length === 0 || images.length !== numberOfImages) {
        setImages(
          Array.from({ length: numberOfImages }, (_, i) => ({
            key: Date.now() + i,
            src: null,
            status: 'placeholder',
          }))
        );
    }
  }, [numberOfImages]);
  
  const handleLicenseActivationSuccess = (newStatus: UserStatus) => {
      setCurrentUserStatus(newStatus);
  };

  const getFullPrompt = () => {
    return [
      prompt, style !== 'Photorealistic' ? style : '', mood !== 'Neutral' ? `${mood} mood` : '',
      lighting !== 'Neutral' ? `${lighting} lighting` : '', color !== 'Default' ? `${color} color scheme` : '',
      negativePrompt ? `avoiding ${negativePrompt}` : ''
    ].filter(Boolean).join(', ');
  };
  
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read blob as base64 string.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  };

  const generateSingleImage = async (signal: AbortSignal): Promise<{ status: 'success'; url: string } | { status: 'error'; message: string } | { status: 'cancelled' }> => {
    try {
        const fullPrompt = getFullPrompt();
        const { width, height } = aspectRatio;
        const seed = Math.floor(Math.random() * 1000000000);
        const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

        const response = await fetch(pollinationUrl, { signal });
        if (!response.ok) throw new Error(`Pollinations.ai error: ${response.statusText}`);

        const blob = await response.blob();
        const base64Image = await blobToBase64(blob);

        // Save to backend in the background, but don't wait for it
        apiSaveImage(base64Image, prompt, fullPrompt, width, height)
            .catch(err => console.error("Failed to save image to backend:", err));

        return { status: 'success', url: URL.createObjectURL(blob) };
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return { status: 'cancelled' };
        }
        const message = err instanceof Error ? err.message : 'Unknown generation error.';
        console.error('Image generation failed:', err);
        return { status: 'error', message };
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setGlobalError('Please enter a prompt to generate an image.');
      return;
    }
    
    setIsGenerating(true);
    setGlobalError(null);
    abortControllers.current = [];

    const initialImages = Array.from({ length: numberOfImages }, (_, i) => ({
        key: Date.now() + i, src: null, status: 'loading' as const, error: null
    }));
    setImages(initialImages);

    const generationPromises = initialImages.map((_, index) => {
        const controller = new AbortController();
        abortControllers.current[index] = controller;
        return generateSingleImage(controller.signal);
    });
    const results = await Promise.all(generationPromises);

    const newImages = initialImages.map((img, index) => {
        const result = results[index];
        if (result.status === 'success') {
            return { ...img, src: result.url, status: 'success' as const };
        }
        if (result.status === 'error') {
            return { ...img, src: null, status: 'error' as const, error: result.message };
        }
        return img; // Keep it loading if cancelled, handleStop will clean up
    });
    
    // Filter out any cancelled ones before saving to local storage
    const finalImages = newImages.filter((_img, index) => results[index].status !== 'cancelled');
    if (finalImages.length > 0) {
        setImages(newImages); // Update UI with all results
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newImages.filter(img => img.status === 'success')));
    }
    setIsGenerating(false);
  };
  
  const handleStop = () => {
    abortControllers.current.forEach(controller => controller.abort());
    setIsGenerating(false);
    setImages(prev => prev.map(img => img.status === 'loading' ? { ...img, status: 'placeholder' } : img));
  };
    
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
        <Select
            label="AI Model"
            value={model}
            onChange={setModel}
            options={OPEN_ROUTER_MODELS.map(m => m.id)}
            displayOptions={OPEN_ROUTER_MODELS.map(m => m.name)}
        />
        <Select
          label="Creative Style"
          value={style}
          onChange={setStyle}
          options={CREATIVE_STYLES}
        />
        <Select
          label="Aspect Ratio"
          value={aspectRatio.name}
          onChange={(val) => {
              const selectedRatio = IMAGEN_BRAIN_RATIOS.find(r => r.name === val);
              if (selectedRatio) setAspectRatio(selectedRatio);
          }}
          options={IMAGEN_BRAIN_RATIOS.map(r => r.name)}
        />
        <Select
             label="Number of Images"
             value={String(numberOfImages)}
             onChange={(e) => setNumberOfImages(parseInt(e, 10))}
             options={['1','2','3','4']}
          />
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
        {isGenerating ? (
            <Button onClick={handleStop} variant="secondary">
                Stop Generating
            </Button>
        ) : (
            <Button onClick={handleGenerate} disabled={!prompt}>
                Generate
            </Button>
        )}
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
                      disabled={isGenerating}
                      onClick={() => { /* Regenerate logic not implemented for client-side */ }}
                      className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm disabled:opacity-50" 
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