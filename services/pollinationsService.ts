import { IMAGEN_BRAIN_RATIOS } from '../constants';

type AspectRatio = typeof IMAGEN_BRAIN_RATIOS[number]['aspectRatio'];

const getDimensionsFromRatio = (aspectRatio: AspectRatio): { width: number; height: number } => {
    // Use a base of 1024 for the longest side for good quality.
    const longSide = 1024;
    
    switch (aspectRatio) {
        case '1:1': return { width: 1024, height: 1024 };
        case '3:4': return { width: 768, height: longSide };
        case '4:3': return { width: longSide, height: 768 };
        case '9:16': return { width: 576, height: longSide };
        case '16:9': return { width: longSide, height: 576 };
        default: return { width: 1024, height: 1024 }; // Default to square
    }
};

/**
 * Generates image URLs using the Pollinations AI URL-based API.
 * This method is faster and more reliable as it avoids serverless function timeouts.
 * @param {string} prompt - The text prompt for the image.
 * @param {AspectRatio} aspectRatio - The desired aspect ratio.
 * @param {number} numberOfImages - The number of images to generate.
 * @returns {Promise<string[]>} - A promise that resolves to an array of direct URLs to the generated images.
 */
export const generateImages = async (
  prompt: string,
  aspectRatio: AspectRatio,
  numberOfImages: number,
): Promise<string[]> => {
  try {
    const { width, height } = getDimensionsFromRatio(aspectRatio);

    // URL-encode the prompt to handle special characters.
    const encodedPrompt = encodeURIComponent(prompt);

    const imageUrls = Array.from({ length: numberOfImages }).map(() => {
        // Generate a random seed for each image to ensure variety.
        const seed = Math.floor(Math.random() * 100000);
        // Construct the direct image URL. The browser will fetch this.
        // The nologo=true parameter helps remove the default watermark.
        return `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    });

    // The function resolves almost instantly with the list of URLs.
    // The browser's <img> tags will handle the actual image loading.
    return Promise.resolve(imageUrls);

  } catch (error) {
    console.error('Error generating Pollinations image URLs:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while preparing the image URLs.');
  }
};

export const downloadImage = async (imageUrl: string, prompt: string, format: 'png' | 'jpeg'): Promise<void> => {
  try {
    const a = document.createElement('a');
    a.style.display = 'none';
    const filename = prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated-image';

    if (imageUrl.startsWith('data:')) {
        // Handle Base64 Data URL
        if (format === 'jpeg') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    if (ctx) {
                      ctx.fillStyle = '#FFFFFF'; // Set a white background for transparency
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0);
                      a.href = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
                      resolve();
                    } else {
                      reject(new Error('Could not get canvas context'));
                    }
                }
                img.onerror = () => reject(new Error('Image failed to load for conversion'));
                img.src = imageUrl;
            });
        } else {
            a.href = imageUrl;
        }
        a.download = `${filename}.${format}`;
    } else {
        // Handle External URL
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        
        const fileExtension = format; // Use the selected format for the extension
        a.href = URL.createObjectURL(blob);
        a.download = `${filename}.${fileExtension}`;
    }
    
    document.body.appendChild(a);
    a.click();
    
    if (!imageUrl.startsWith('data:')) {
        URL.revokeObjectURL(a.href);
    }
    
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Could not download the image.');
  }
};
