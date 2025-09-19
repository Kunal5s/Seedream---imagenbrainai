import React, { useState } from 'react';
import { generateImages, downloadImage } from '../services/geminiService';
import { CREATIVE_STYLES, IMAGEN_BRAIN_RATIOS, MOODS, LIGHTING_STYLES, COLORS } from '../constants';
import Button from './ui/Button';
import Select from './ui/Select';
import Spinner from './ui/Spinner';
import ImagePlaceholder from './ui/ImagePlaceholder';
import ImageErrorPlaceholder from './ui/ImageErrorPlaceholder';
import RegenerateIcon from './ui/RegenerateIcon';
import DownloadIcon from './ui/DownloadIcon';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState(CREATIVE_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState(IMAGEN_BRAIN_RATIOS[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [lighting, setLighting] = useState(LIGHTING_STYLES[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [numberOfImages, setNumberOfImages] = useState(4);
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);

  const constructFinalPrompt = () => {
    let finalPrompt = prompt;
    if (style !== 'Photorealistic') {
      finalPrompt += `, ${style} style`;
    }
    if (mood !== 'Neutral') {
      finalPrompt += `, ${mood} mood`;
    }
    if (lighting !== 'Neutral') {
      finalPrompt += `, ${lighting} lighting`;
    }
    if (color !== 'Default') {
      finalPrompt += `, ${color}`;
    }
    if (negativePrompt) {
      finalPrompt += ` | negative prompt: ${negativePrompt}`;
    }
    return finalPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    try {
      const finalPrompt = constructFinalPrompt();
      const images = await generateImages(finalPrompt, aspectRatio.aspectRatio, numberOfImages);
      setGeneratedImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, format: 'png' | 'jpeg') => {
    downloadImage(imageUrl, prompt, format);
  };
  
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

      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Images'}
      </Button>

      {error && !isLoading && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}
      
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start justify-center">
          {isLoading && Array.from({ length: numberOfImages }).map((_, i) => (
              <div key={i} className={`${aspectRatio.className} w-full bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center`}>
                <Spinner />
              </div>
          ))}
          {!isLoading && generatedImages.length === 0 && !error && Array.from({ length: numberOfImages }).map((_, i) => (
             <ImagePlaceholder key={i} aspectRatioClass={aspectRatio.className} />
          ))}
          {!isLoading && error && <ImageErrorPlaceholder message={error} aspectRatioClass={aspectRatio.className} />}
          {!isLoading && generatedImages.length > 0 && generatedImages.map((imageSrc, index) => (
            <div key={index} className={`relative group w-full ${aspectRatio.className}`}>
              <img src={imageSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain rounded-lg bg-black" />
              <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleGenerate} 
                  className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                  title="Regenerate All">
                  <RegenerateIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDownload(imageSrc, 'png')} 
                  className="text-gray-300 hover:text-green-300 transition-colors p-1.5 rounded-full bg-black/60 backdrop-blur-sm" 
                  title="Download as PNG">
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;