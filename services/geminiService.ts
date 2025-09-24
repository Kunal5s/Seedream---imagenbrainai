import { GoogleGenAI, Modality, Type } from "@google/genai";
import { sitemap } from "../data/sitemap";

let ai: GoogleGenAI | null = null;

// Lazily initialize the AI client.
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

// FIX: Implement and export the missing `generateImages` function to resolve import errors.
/**
 * Generates images using the Gemini Imagen 4.0 model.
 * @param prompt The text prompt for the image.
 * @param aspectRatio The desired aspect ratio.
 * @param numberOfImages The number of images to generate.
 * @returns A promise that resolves to an array of base64 data URLs of the generated images.
 */
export const generateImages = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
  numberOfImages: number
): Promise<string[]> => {
  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => {
        const base64ImageBytes: string = img.image?.imageBytes ?? '';
        return `data:image/png;base64,${base64ImageBytes}`;
      });
    }

    throw new Error('No images were returned from the API.');
  } catch (error) {
    console.error('Error generating images with Gemini:', error);
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

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const imageMimeType = part.inlineData.mimeType;
        return `data:${imageMimeType};base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error('No edited image was returned from the API.');
  } catch (error) {
    console.error('Error editing image:', error);
    // Re-throw the original error to be displayed in the component UI
    throw error;
  }
};

export const summarizeArticle = async (articleText: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const prompt = `Summarize the following article into a concise and easy-to-read summary. Focus on the main points and key takeaways.\n\n---\n\n${articleText}`;
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? '';
  } catch (error) {
    console.error('Error summarizing article with Gemini:', error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
        throw new Error('Failed to generate summary: API Key is invalid or missing.');
    }
    throw new Error('An error occurred while generating the summary.');
  }
};

// FIX: Implement and export missing article generation functions.
/**
 * Generates a full blog post article based on a given topic.
 * @param topic The topic of the article.
 * @returns A promise that resolves to the HTML content of the article.
 */
export const generateFullArticle = async (topic: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const prompt = `You are an expert blog post writer and SEO specialist. Your task is to write a comprehensive, engaging, and well-structured blog post on the topic of "${topic}".

    The article should have:
    1.  An engaging introduction that hooks the reader.
    2.  Several well-defined sections with clear headings (using <h2> and <h3> tags).
    3.  Detailed, informative content in each section. Use paragraphs (<p>), lists (<ul>, <li>), and bold text (<strong>) to improve readability.
    4.  A strong concluding summary.
    5.  The tone should be authoritative but accessible.

    Please output the article content in clean HTML format. Do not include <html>, <head>, or <body> tags. Just provide the content that would go inside the <body>.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? '';
  } catch (error) {
    console.error('Error generating full article:', error);
    throw new Error('Failed to generate the full article.');
  }
};

/**
 * Generates metadata for a blog article.
 * @param content The content of the article.
 * @param topic The topic of the article.
 * @returns A promise that resolves to an object containing title, excerpt, categories, and keywords.
 */
export const generateArticleMetadata = async (content: string, topic: string): Promise<{ title: string; excerpt: string; categories: string[]; keywords?: string[] }> => {
  try {
    const aiClient = getAiClient();
    const prompt = `Analyze the following blog post content about "${topic}" and generate the necessary metadata.
    
    Article Content:
    ---
    ${content.substring(0, 8000)}
    ---
    
    Please generate a concise and SEO-friendly title, a compelling excerpt (meta description, max 160 characters), a list of 3-5 relevant categories, and an optional list of 5-7 relevant keywords.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A concise and SEO-friendly title for the blog post."
            },
            excerpt: {
              type: Type.STRING,
              description: "A compelling meta description, maximum 160 characters."
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3 to 5 relevant categories for the blog post."
            },
            keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An optional list of 5 to 7 relevant keywords for SEO."
            }
          },
        },
      }
    });

    const jsonStr = (response.text ?? '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating article metadata:', error);
    throw new Error('Failed to generate article metadata.');
  }
};

/**
 * Generates a single section of a blog article.
 * @param topic The main topic of the article.
 * @param keywords Relevant keywords for the section.
 * @param sectionTitle The title of the section to generate.
 * @returns A promise that resolves to the HTML content of the article section.
 */
export const generateArticleSection = async (topic: string, keywords: string, sectionTitle: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const prompt = `Write a detailed, engaging, and well-structured section for a blog post.
    Topic of the article: "${topic}"
    Section to write: "${sectionTitle}"
    Keywords to include naturally: "${keywords}"
    The output should be in HTML format, using tags like <p>, <ul>, <li>, <strong>, etc. Do not include <html>, <head>, or <body> tags. The tone should be informative and captivating.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? '';
  } catch (error) {
    console.error('Error generating article section:', error);
    throw new Error('Failed to generate the article section.');
  }
};

/**
 * Adds internal links to article content based on a sitemap.
 * @param content The HTML content of the article.
 * @returns A promise that resolves to the updated HTML content with internal links.
 */
export const addLinksToArticle = async (content: string): Promise<string> => {
  try {
    const aiClient = getAiClient();
    const sitemapString = sitemap.map(page => `- Path: ${page.path}, Description: ${page.description}`).join('\n');

    const prompt = `You are an SEO expert. Your task is to add relevant internal links to the provided HTML blog post content.
    Here is the sitemap of available pages to link to:
    ---SITEMAP---
    ${sitemapString}
    ---END SITEMAP---

    Here is the article content (HTML):
    ---ARTICLE---
    ${content}
    ---END ARTICLE---

    Please analyze the article content and strategically insert 2-3 relevant internal links using anchor tags (\`<a>\`).
    - The links should be contextually relevant.
    - The anchor text should be natural and engaging.
    - Use the paths from the sitemap for the href attribute.
    - Do not add any other links or change the content in any other way.
    - Return the full HTML content with the links added.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? '';
  } catch (error) {
    console.error('Error adding links to article:', error);
    throw new Error('Failed to add internal links to the article.');
  }
};