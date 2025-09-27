import React, { useState, useEffect, useRef } from 'react';
import { downloadImage } from '../services/generationService';
import { apiSaveImage } from '../services/apiService';
import { IMAGEN_BRAIN_RATIOS, BOOSTER_MODEL } from '../constants';
import Button from './ui/Button';
import Select from './ui/Select';
import MoonLoader from './ui/MoonLoader';
import ImagePlaceholder from './ui/ImagePlaceholder';
import ImageErrorPlaceholder from './ui/ImageErrorPlaceholder';
import SuccessWrapper from './ui/SuccessWrapper';
import RegenerateIcon from './ui/RegenerateIcon';
import DownloadIcon from './ui/DownloadIcon';
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

const LOCAL_STORAGE_KEY = 'seedream_last_generation_pollination';

const DiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.5a.5.5 0 001 0V4a2 2 0 10-4 0v1.5a.5.5 0 001 0V4a1 1 0 011-1zM5.05 5.05a1 1 0 011.414 0L7.88 6.464a.5.5 0 00.707-.707L7.172 4.343a2 2 0 10-2.828 2.828l1.414-1.414a.5.5 0 00-.707-.707L5.05 6.464a1 1 0 01-1.414-1.414zM10 15a1 1 0 011-1h1.5a.5.5 0 000-1H11a2 2 0 100 4h1.5a.5.5 0 000-1H11a1 1 0 01-1-1zM14.95 14.95a1 1 0 01-1.414 0l-1.414-1.414a.5.5 0 00-.707.707l1.414 1.414a2 2 0 102.828-2.828l-1.414 1.414a.5.5 0 00.707.707l1.414-1.414a1 1 0 011.414 1.414zM4 10a1 1 0 01-1 1v1.5a.5.5 0 000 1V14a2 2 0 104 0v-1.5a.5.5 0 00-1 0V14a1 1 0 01-2 0v-1.5a.5.5 0 00-1 0V11a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const PollinationGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState(IMAGEN_BRAIN_RATIOS[0]);
    const [numberOfImages, setNumberOfImages] = useState(4);
    const [isGenerating, setIsGenerating] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

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

    const abortControllers = useRef<AbortController[]>([]);

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
        if (images.length === 0 || images.length !== numberOfImages) {
            setImages(
                Array.from({ length: numberOfImages }, (_, i) => ({
                    key: Date.now() + i, src: null, status: 'placeholder',
                }))
            );
        }
    }, [numberOfImages]);

    const handleRandomize = () => {
        const getRandomOption = (options: string[]) => {
            const filteredOptions = options.filter(opt => opt !== 'Default');
            return filteredOptions[Math.floor(Math.random() * filteredOptions.length)] || options[0];
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

    const getFullPrompt = () => {
        return [
            prompt, style !== 'Default' ? style : '', mood !== 'Default' ? mood : '',
            lighting !== 'Default' ? lighting : '', color !== 'Default' ? `${color} color scheme` : '',
            cameraAngle !== 'Default' ? cameraAngle : '', artistMovement !== 'Default' ? `in the style of ${artistMovement}` : '',
            composition !== 'Default' ? `${composition} composition` : '', artMedium !== 'Default' ? artMedium : '',
            detailLevel !== 'Default' ? detailLevel : '', timeOfDay !== 'Default' ? `at ${timeOfDay}` : '',
            weather !== 'Default' ? `with ${weather}` : '', setting !== 'Default' ? `in a ${setting} setting` : '',
            lens !== 'Default' ? `${lens} lens` : '', renderEngine !== 'Default' ? `rendered in ${renderEngine}` : '',
        ].filter(Boolean).join(', ');
    };

    const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    const generateSingleImage = async (signal: AbortSignal): Promise<{ status: 'success'; url: string } | { status: 'error'; message: string } | { status: 'cancelled' }> => {
        try {
            const fullPrompt = getFullPrompt();
            const { width, height } = aspectRatio;
            const seed = Math.floor(Math.random() * 1000000000);
            const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

            const response = await fetch(pollinationUrl, { signal });
            if (!response.ok) throw new Error(`Image service error: ${response.statusText}`);

            const blob = await response.blob();
            const base64Image = await blobToBase64(blob);

            // Save to backend but don't wait for it to finish to show the image
            apiSaveImage(base64Image, prompt, fullPrompt, width, height, false).catch(err => console.error("Failed to save image to backend:", err));

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
            if (result.status === 'success') return { ...img, src: result.url, status: 'success' as const };
            if (result.status === 'error') return { ...img, src: null, status: 'error' as const, error: result.message };
            return img; // Keep as loading if cancelled
        });

        if (newImages.some(img => img.status !== 'loading')) {
            setImages(newImages);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newImages.filter(img => img.status === 'success')));
        }
        
        setIsGenerating(false);
    };

    const handleStop = () => {
        abortControllers.current.forEach(controller => controller.abort());
        setIsGenerating(false);
        setImages(prev => prev.map(img => img.status === 'loading' ? { ...img, status: 'placeholder' } : img));
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="pollination-prompt" className="block text-lg font-medium text-yellow-300 mb-2">Describe your vision</label>
                <textarea id="pollination-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" placeholder="e.g., a beautiful painting of a whimsical landscape by studio ghibli, detailed, 4k" />
                <p className="text-xs text-gray-500 mt-2">This generator is free and does not use credits. Art by Seedream Imagenbrainai.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Select 
                    label="AI Model" 
                    value={BOOSTER_MODEL.id} 
                    onChange={() => {}} 
                    options={[BOOSTER_MODEL.id]} 
                    displayOptions={[BOOSTER_MODEL.name]} 
                    disabled={true} 
                />
                <Select label="Aspect Ratio" value={aspectRatio.name} onChange={(val) => { const r = IMAGEN_BRAIN_RATIOS.find(r => r.name === val); if (r) setAspectRatio(r); }} options={IMAGEN_BRAIN_RATIOS.map(r => r.name)} />
                <Select label="Number of Images" value={String(numberOfImages)} onChange={(val) => setNumberOfImages(parseInt(val, 10))} options={['1', '2', '3', '4']} />
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={() => setAdvancedOptionsVisible(!advancedOptionsVisible)} className="text-yellow-300 hover:text-yellow-200 text-sm font-semibold">
                    {advancedOptionsVisible ? 'Hide Advanced Creative Controls ▼' : 'Show Advanced Creative Controls ▲'}
                </button>
                <button onClick={handleRandomize} className="flex items-center gap-2 text-sm font-semibold bg-gray-800 text-yellow-300 py-1 px-3 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10"><DiceIcon /> Randomize Options</button>
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
                {isGenerating ? (
                    <Button onClick={handleStop} variant="secondary">Stop Generating</Button>
                ) : (
                    <Button onClick={handleGenerate} disabled={!prompt} variant="secondary">Generate with Seedream Booster</Button>
                )}
            </div>

            {globalError && !isGenerating && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{globalError}</p>}
      
            <div className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start justify-center">
                    {images.map((image) => (
                        <div key={image.key} className={`relative group w-full ${aspectRatio.className} bg-gray-900/50 rounded-lg border-2 border-dashed border-yellow-700/50 flex items-center justify-center`}>
                            {image.status === 'placeholder' && <ImagePlaceholder aspectRatioClass={aspectRatio.className} />}
                            {image.status === 'loading' && <MoonLoader />}
                            {image.status === 'success' && image.src && <SuccessWrapper src={image.src} alt={`Generated image`} />}
                            {image.status === 'error' && <ImageErrorPlaceholder message={image.error || 'An error occurred'} aspectRatioClass={aspectRatio.className} />}
                            {image.status === 'success' && image.src && (
                                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => {}} className="text-gray-300 hover:text-yellow-300 transition-colors p-1.5 rounded-full bg-black/60 disabled:opacity-50" title="Regenerate this image" disabled><RegenerateIcon className="w-5 h-5" /></button>
                                    <button onClick={() => downloadImage(image.src!, prompt)} className="text-gray-300 hover:text-yellow-300 transition-colors p-1.5 rounded-full bg-black/60" title="Download as PNG"><DownloadIcon className="w-5 h-5" /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PollinationGenerator;