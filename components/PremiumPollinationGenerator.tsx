import React, { useState, useEffect } from 'react';
import { IMAGEN_BRAIN_RATIOS } from '../constants';
import Button from './ui/Button';
import Select from './ui/Select';
import MoonLoader from './ui/MoonLoader';
import ImagePlaceholder from './ui/ImagePlaceholder';
import SuccessWrapper from './ui/SuccessWrapper';
import ImageErrorPlaceholder from './ui/ImageErrorPlaceholder';
import { 
    PREMIUM_STYLES, PREMIUM_MOODS, PREMIUM_LIGHTING, PREMIUM_COLORS,
    CAMERA_ANGLES, ARTISTS_MOVEMENTS, COMPOSITIONS, ART_MEDIUMS,
    DETAIL_LEVELS, TIMES_OF_DAY, WEATHER_EFFECTS, SETTINGS_ENVIRONMENTS,
    LENS_TYPES, RENDER_ENGINES
} from '../constants/premiumConstants';

interface ImageState {
    key: number;
    src: string | null;
    status: 'placeholder' | 'loading' | 'success' | 'error';
    error?: string | null;
}

const DiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const PremiumPollinationGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(IMAGEN_BRAIN_RATIOS[0]);
  const [numberOfImages, setNumberOfImages] = useState(4);
  const [images, setImages] = useState<ImageState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // --- New State for Advanced Options ---
  const [advancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
  const [style, setStyle] = useState(PREMIUM_STYLES[0]);
  const [mood, setMood] = useState(PREMIUM_MOODS[0]);
  const [lighting, setLighting] = useState(PREMIUM_LIGHTING[0]);
  const [color, setColor] = useState(PREMIUM_COLORS[0]);
  const [cameraAngle, setCameraAngle] = useState(CAMERA_ANGLES[0]);
  const [artistMovement, setArtistMovement] = useState(ARTISTS_MOVEMENTS[0]);
  const [composition, setComposition] = useState(COMPOSITIONS[0]);
  const [artMedium, setArtMedium] = useState(ART_MEDIUMS[0]);
  const [detailLevel, setDetailLevel] = useState(DETAIL_LEVELS[0]);
  const [timeOfDay, setTimeOfDay] = useState(TIMES_OF_DAY[0]);
  const [weather, setWeather] = useState(WEATHER_EFFECTS[0]);
  const [setting, setSetting] = useState(SETTINGS_ENVIRONMENTS[0]);
  const [lens, setLens] = useState(LENS_TYPES[0]);
  const [renderEngine, setRenderEngine] = useState(RENDER_ENGINES[0]);


  useEffect(() => {
    setImages(
      Array.from({ length: numberOfImages }, (_, i) => ({
        key: Date.now() + i,
        src: null,
        status: 'placeholder',
      }))
    );
  }, [numberOfImages]);
  
  const handleRandomize = () => {
    const getRandomOption = (options: string[]) => {
      const filteredOptions = options.filter(opt => opt !== 'Default');
      const randomIndex = Math.floor(Math.random() * filteredOptions.length);
      return filteredOptions[randomIndex];
    };
    
    setStyle(getRandomOption(PREMIUM_STYLES));
    setMood(getRandomOption(PREMIUM_MOODS));
    setLighting(getRandomOption(PREMIUM_LIGHTING));
    setColor(getRandomOption(PREMIUM_COLORS));
    setCameraAngle(getRandomOption(CAMERA_ANGLES));
    setArtistMovement(getRandomOption(ARTISTS_MOVEMENTS));
    setComposition(getRandomOption(COMPOSITIONS));
    setArtMedium(getRandomOption(ART_MEDIUMS));
    setDetailLevel(getRandomOption(DETAIL_LEVELS));
    setTimeOfDay(getRandomOption(TIMES_OF_DAY));
    setWeather(getRandomOption(WEATHER_EFFECTS));
    setSetting(getRandomOption(SETTINGS_ENVIRONMENTS));
    setLens(getRandomOption(LENS_TYPES));
    setRenderEngine(getRandomOption(RENDER_ENGINES));
    
    setAdvancedOptionsVisible(true);
  };

  const handleGenerate = () => {
    if (!prompt) {
      setGlobalError('Please enter a prompt to generate an image.');
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);
    setImages(images.map(img => ({ ...img, status: 'loading', src: null, error: null })));

    // Combine all options into a detailed prompt
    const fullPrompt = [
        prompt,
        style !== 'Default' ? style : '',
        mood !== 'Default' ? mood : '',
        lighting !== 'Default' ? lighting : '',
        color !== 'Default' ? `${color} color scheme` : '',
        cameraAngle !== 'Default' ? cameraAngle : '',
        artistMovement !== 'Default' ? `in the style of ${artistMovement}` : '',
        composition !== 'Default' ? `${composition} composition` : '',
        artMedium !== 'Default' ? artMedium : '',
        detailLevel !== 'Default' ? detailLevel : '',
        timeOfDay !== 'Default' ? `at ${timeOfDay}` : '',
        weather !== 'Default' ? `with ${weather}` : '',
        setting !== 'Default' ? `in a ${setting} setting` : '',
        lens !== 'Default' ? `${lens} lens` : '',
        renderEngine !== 'Default' ? `rendered in ${renderEngine}` : '',
    ].filter(Boolean).join(', ');
    
    setTimeout(() => {
        const newImagesState = images.map((_, index) => {
            const seed = Date.now() + index;
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${aspectRatio.width}&height=${aspectRatio.height}&nologo=true&seed=${seed}`;
            
            return {
                key: Date.now() + index,
                src: url,
                status: 'success' as const,
                error: null,
            };
        });

        setImages(newImagesState);
        setIsGenerating(false);
    }, 500); // Small delay to allow loader to appear
  };


  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="premium-prompt" className="block text-lg font-medium text-yellow-300 mb-2">
          Describe your vision for Pollination AI
        </label>
        <textarea
          id="premium-prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
          placeholder="e.g., a beautiful painting of a whimsical landscape by studio ghibli, detailed, 4k"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Aspect Ratio" value={aspectRatio.name} onChange={(val) => {const r = IMAGEN_BRAIN_RATIOS.find(r=>r.name===val); if(r)setAspectRatio(r);}} options={IMAGEN_BRAIN_RATIOS.map(r=>r.name)} />
        <Select label="Number of Images" value={String(numberOfImages)} onChange={(val) => setNumberOfImages(parseInt(val, 10))} options={['1','2','3','4']} />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setAdvancedOptionsVisible(!advancedOptionsVisible)}
          className="text-yellow-300 hover:text-yellow-200 text-sm font-semibold"
        >
          {advancedOptionsVisible ? 'Hide Advanced Creative Controls ▼' : 'Show Advanced Creative Controls ▲'}
        </button>
        <button
            onClick={handleRandomize}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-800 text-yellow-300 py-1 px-3 rounded-lg border border-yellow-400/30 transition-all duration-300 transform hover:bg-yellow-400/10 focus:outline-none focus:ring-2 ring-yellow-400"
        >
            <DiceIcon />
            Randomize Options
        </button>
      </div>
      
      {advancedOptionsVisible && (
         <div className="space-y-4 p-4 border border-yellow-400/20 rounded-lg bg-gray-900/50">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Select label="Creative Style" value={style} onChange={setStyle} options={PREMIUM_STYLES} />
             <Select label="Mood" value={mood} onChange={setMood} options={PREMIUM_MOODS} />
             <Select label="Lighting Style" value={lighting} onChange={setLighting} options={PREMIUM_LIGHTING} />
             <Select label="Color Scheme" value={color} onChange={setColor} options={PREMIUM_COLORS} />
             <Select label="Camera Angle" value={cameraAngle} onChange={setCameraAngle} options={CAMERA_ANGLES} />
             <Select label="Artist & Style" value={artistMovement} onChange={setArtistMovement} options={ARTISTS_MOVEMENTS} />
             <Select label="Composition" value={composition} onChange={setComposition} options={COMPOSITIONS} />
             <Select label="Art Medium" value={artMedium} onChange={setArtMedium} options={ART_MEDIUMS} />
             <Select label="Level of Detail" value={detailLevel} onChange={setDetailLevel} options={DETAIL_LEVELS} />
             <Select label="Time of Day" value={timeOfDay} onChange={setTimeOfDay} options={TIMES_OF_DAY} />
             <Select label="Weather Effects" value={weather} onChange={setWeather} options={WEATHER_EFFECTS} />
             <Select label="Setting / Environment" value={setting} onChange={setSetting} options={SETTINGS_ENVIRONMENTS} />
             <Select label="Camera Lens" value={lens} onChange={setLens} options={LENS_TYPES} />
             <Select label="Render Engine Style" value={renderEngine} onChange={setRenderEngine} options={RENDER_ENGINES} />
           </div>
         </div>
      )}

      <div className="text-center">
        <Button onClick={handleGenerate} disabled={!prompt || isGenerating}>
          {isGenerating ? 'Generating with Pollination...' : 'Generate with Pollination'}
        </Button>
      </div>

      {globalError && !isGenerating && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{globalError}</p>}

      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start justify-center">
          {images.map((image) => (
            <div key={image.key} className={`relative group w-full ${aspectRatio.className} bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center`}>
              {image.status === 'placeholder' && <ImagePlaceholder aspectRatioClass={aspectRatio.className} />}
              {image.status === 'loading' && <MoonLoader />}
              {image.status === 'success' && image.src && <SuccessWrapper src={image.src} alt={`Generated pollination image`} />}
              {image.status === 'error' && <ImageErrorPlaceholder message={image.error || 'An error occurred'} aspectRatioClass={aspectRatio.className} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumPollinationGenerator;