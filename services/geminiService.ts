import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI client.
// This prevents the app from crashing on load if the API key is missing.
// Instead, an error will be thrown when the user tries to perform an action,
// which can be caught and displayed gracefully in the UI.
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is not configured. Please set it in your Vercel project environment variables.");
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
};


type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export const generateImages = async (prompt: string, aspectRatio: AspectRatio, numberOfImages: number): Promise<string[]> => {
  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    }

    throw new Error('No images were returned from the API.');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error('Image generation failed due to safety policies. Please try a different prompt.');
    }
    // Re-throw the original error to be displayed in the component UI
    throw error;
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

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          return `data:${imageMimeType};base64,${base64ImageBytes}`;
        }
      }
    }
    
    throw new Error('No edited image was returned from the API.');
  } catch (error) {
    console.error('Error editing image:', error);
    // Re-throw the original error to be displayed in the component UI
    throw error;
  }
};