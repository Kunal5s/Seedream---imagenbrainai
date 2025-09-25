import { UserStatus } from './licenseService';

// This would typically be in an environment variable, but for this context,
// it's fine to have it here as it points to the same origin's API routes.
const API_BASE_URL = '/api';

export interface ImageHistoryItem {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

// A generic helper function to handle fetch requests and standardized error handling.
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.statusText}`);
    }

    if (response.status === 204) { // Handle "No Content" responses
      return null as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// --- API Service Functions ---

/**
 * Fetches the current user's status from the backend.
 * The backend should identify the user via a session cookie.
 */
export const apiGetUserStatus = (): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/user/status', { method: 'GET' });
};

/**
 * Sends a license key and email to the backend for activation.
 * @param email The email used during purchase.
 * @param key The license key from Polar.sh.
 * @returns The user's updated status from the backend.
 */
export const apiActivateLicense = (email: string, key: string): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/license/activate', {
    method: 'POST',
    body: JSON.stringify({ email, key }),
  });
};

/**
 * Sends a comprehensive generation request to the backend.
 * The backend handles the AI call, R2 upload, and credit deduction.
 * @returns An object containing the new R2 image URLs and the user's updated credit balance.
 */
export const apiGenerateImages = (
    prompt: string, 
    negativePrompt: string, 
    style: string, 
    aspectRatio: string, 
    mood: string, 
    lighting: string, 
    color: string, 
    numberOfImages: number
): Promise<{ imageUrls: string[], credits: number }> => {
    return fetchApi<{ imageUrls: string[], credits: number }>('/images/generate', {
        method: 'POST',
        body: JSON.stringify({ 
            prompt, 
            negativePrompt, 
            style, 
            aspectRatio, 
            mood, 
            lighting, 
            color, 
            numberOfImages 
        }),
    });
};

/**
 * Fetches the user's generated image history from the backend.
 */
export const apiGetImageHistory = (): Promise<ImageHistoryItem[]> => {
    return fetchApi<ImageHistoryItem[]>('/images/history', { method: 'GET' });
};