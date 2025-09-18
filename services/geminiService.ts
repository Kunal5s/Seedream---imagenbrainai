// FIX: Import Modality for use in the image editing function.
import { GoogleGenAI, Modality } from "@google/genai";

// FIX: The original code used `import.meta.env.VITE_API_KEY`, which caused a TypeScript error
// (`Property 'env' does not exist on type 'ImportMeta'`) and violated the Gemini API guidelines.
// The code is now updated to use `process.env.API_KEY` as mandated by the guidelines.
// It's assumed the execution environment (e.g., Vite build process) is configured to make this variable available.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please ensure it is configured in your deployment environment (e.g., Vercel).");
}
  
const ai = new GoogleGenAI({ apiKey });

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error('No image was returned from the API.');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error('Image generation failed due to safety policies. Please try a different prompt.');
    }
    throw new Error('Failed to generate image. Please try again.');
  }
};

export const downloadGeneratedImage = async (imageDataUrl: string, prompt: string, format: 'png' | 'jpeg'): Promise<void> => {
  try {
    const a = document.createElement('a');
    a.style.display = 'none';
    
    if (format === 'jpeg') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  a.href = canvas.toDataURL('image/jpeg');
                  resolve();
                } else {
                  reject(new Error('Could not get canvas context'));
                }
            }
            img.onerror = () => reject(new Error('Image failed to load for conversion'));
            img.src = imageDataUrl;
        });
    } else {
        a.href = imageDataUrl;
    }
    
    const filename = prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated-image';
    a.download = `${filename}.${format}`;
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Could not download the image.');
  }
};

// FIX: Export 'editImage' function to be used in ImageEditor.tsx.
// This function takes a base64 encoded image, its MIME type, and a text prompt
// to edit the image using the 'gemini-2.5-flash-image-preview' model.
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
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
    throw new Error('Failed to edit image. Please try again.');
  }
};
