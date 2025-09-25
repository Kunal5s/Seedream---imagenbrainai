import { apiGenerateImages } from './apiService';

/**
 * A simple abstraction layer for the image generation API call.
 * This makes the component code cleaner and independent of the API service's implementation details.
 */
export const generateImages = (
    prompt: string, 
    negativePrompt: string, 
    style: string, 
    aspectRatio: string, 
    mood: string, 
    lighting: string, 
    color: string, 
    numberOfImages: number
) => {
    return apiGenerateImages(prompt, negativePrompt, style, aspectRatio, mood, lighting, color, numberOfImages);
};

/**
 * The download function can remain on the client-side as it works with public URLs.
 * @param imageUrl The public URL of the image (now from R2).
 * @param prompt The original prompt for the filename.
 */
export const downloadImage = (imageUrl: string, prompt: string) => {
  try {
    const a = document.createElement('a');
    a.href = imageUrl;
    const safePrompt = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safePrompt || 'generated-image'}.png`;
    // For R2 URLs, we might need to fetch the blob if direct download is blocked by CORS.
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Could not download image. Please try right-clicking and saving.');
  }
};
