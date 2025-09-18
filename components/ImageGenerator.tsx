
import React, { useState } from 'react';
import { generateImage, downloadGeneratedImage } from '../services/geminiService';
import { 
  POLLINATIONS_STYLES, 
  POLLINATIONS_RATIOS, 
  MOODS, 
  LIGHTING_STYLES, 
  COLORS
} from '../constants';
import Select from './ui/Select';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(POLLINATIONS_STYLES[0]);
  const [selectedMood, setSelectedMood] = useState<string>(MOODS[0]);
  const [selectedLighting, setSelectedLighting] = useState<string>(LIGHTING_STYLES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);

  const [selectedRatioName, setSelectedRatioName] = useState<string>(POLLINATIONS_RATIOS[0].name);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);

    try {
      const finalPrompt = `${prompt}, ${selectedStyle} style, ${selectedMood} mood, ${selectedLighting}, ${selectedColor} color palette, 4k, photorealistic`;
      
      const ratio = POLLINATIONS_RATIOS.find(r => r.name === selectedRatioName);
      if (!ratio) {
        throw new Error("Selected aspect ratio not found.");
      }
      const aspectRatio = ratio.aspectRatio;

      // Create 4 image generation promises to run in parallel
      const imagePromises = Array.from({ length: 4 }).map(() => 
        generateImage(finalPrompt, aspectRatio)
      );

      const imageUrls = await Promise.all(imagePromises);
      setGeneratedImages(imageUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, format: 'png' | 'jpeg') => {
    if (!imageUrl) return;
    setIsDownloading(true);
    setError(null);
    try {
      await downloadGeneratedImage(imageUrl, prompt, format);
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred during download.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-green-300 mb-2">
            Your Vision
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
            placeholder="e.g., A cute baby elephant painting in a forest"
          />
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-green-300 mb-2">Creative Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Style" value={selectedStyle} onChange={setSelectedStyle} options={POLLINATIONS_STYLES} />
            <Select label="Mood" value={selectedMood} onChange={setSelectedMood} options={MOODS} />
            <Select label="Lighting" value={selectedLighting} onChange={setSelectedLighting} options={LIGHTING_STYLES} />
            <Select label="Color" value={selectedColor} onChange={setSelectedColor} options={COLORS} />
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-green-300 mb-2">Technical Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Aspect Ratio" 
              value={selectedRatioName}
              onChange={setSelectedRatioName}
              options={POLLINATIONS_RATIOS.map(r => r.name)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? 'Generating...' : generatedImages ? 'Generate New' : 'Generate'}
            </Button>
            {generatedImages && !isLoading && (
                <Button onClick={handleGenerate} disabled={isLoading} variant="secondary">
                    Regenerate
                </Button>
            )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 min-h-[300px] lg:min-h-full p-4">
        {isLoading && <Spinner />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {generatedImages && !isLoading && (
            <div className="grid grid-cols-2 gap-4 w-full">
                {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 p-2 bg-gray-900 rounded-lg border border-gray-700">
                        <img src={imageUrl} alt={`Generated art ${index + 1}`} className="rounded-md w-full aspect-square object-contain" />
                        <div className="flex gap-2 w-full mt-auto">
                            <button
                                onClick={() => handleDownload(imageUrl, 'png')}
                                disabled={isDownloading}
                                className="flex-1 bg-gray-700 text-gray-200 text-sm py-1.5 px-2 rounded hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                            >
                                {isDownloading ? '...' : 'PNG'}
                            </button>
                            <button
                                onClick={() => handleDownload(imageUrl, 'jpeg')}
                                disabled={isDownloading}
                                className="flex-1 bg-gray-700 text-gray-200 text-sm py-1.5 px-2 rounded hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                            >
                               {isDownloading ? '...' : 'JPEG'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        {!isLoading && !error && !generatedImages && (
          <p className="text-gray-500">Your generated images will appear here</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
