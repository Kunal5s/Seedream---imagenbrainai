import { apiGenerateImages } from './apiService';

/**
 * A wrapper for the API call to generate images.
 * This encapsulates any client-side logic before calling the API.
 */
export const generateImages = (
    prompt: string, 
    negativePrompt: string, 
    style: string, 
    aspectRatio: string, 
    mood: string, 
    lighting: string, 
    color: string, 
    numberOfImages: number,
    model: string
) => {
    // The return type is now Promise<GenerationResponse> from apiService
    return apiGenerateImages(prompt, negativePrompt, style, aspectRatio, mood, lighting, color, numberOfImages, model);
};

/**
 * Triggers a browser download for a given image URL.
 * @param imageUrl The URL of the image to download.
 * @param prompt The prompt used to generate the image, used for the filename.
 */
export const downloadImage = (imageUrl: string, prompt: string) => {
    // Sanitize the prompt to create a valid filename
    const filename = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Use fetch to get the image data as a blob. This is more robust for CORS.
    fetch(imageUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.blob();
    })
    .then(blob => {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename || 'seedream_image'}.png`;
        // Append the link to the body, click it, and then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Revoke the temporary URL to free up memory
        window.URL.revokeObjectURL(url);
    })
    .catch(err => {
        console.error('Failed to download image via fetch, falling back to direct link:', err);
        // Fallback for potential CORS issues: create a link and let the browser handle it.
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank'; // Open in new tab as a fallback
        link.download = `${filename || 'seedream_image'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
};