// FIX: Import Modality for use in the image editing function.
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImages = async (prompt: string, width: number, height: number): Promise<string[]> => {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Create 4 image generation promises to run in parallel
    const imagePromises = Array.from({ length: 4 }).map(() => {
      // Use a different random seed for each image to get variations
      const seed = Math.floor(Math.random() * 100000); 
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      return Promise.resolve(imageUrl);
    });

    return await Promise.all(imagePromises);
  } catch (error) {
    console.error('Error constructing image URLs:', error);
    throw new Error('Failed to construct the image URLs.');
  }
};

export const downloadGeneratedImage = async (imageUrl: string, prompt: string, format: 'png' | 'jpeg'): Promise<void> => {
  try {
    // To bypass potential CORS issues when fetching the image from a script,
    // we use a CORS proxy. This allows us to download the image data directly.
    const proxyImageUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyImageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image via proxy. Status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    const filename = prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated-image';
    a.download = `${filename}.${format}`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Could not download the image. The proxy or image service may be unavailable.');
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