import { UserStatus } from './licenseService';

const API_BASE_URL = '/api';

// A more comprehensive record for an image, used in history and marketplace
export interface ImageRecord {
  id: string;
  url: string;
  prompt: string;
  fullPrompt: string;
  width: number;
  height: number;
  createdAt: string;
  expiresAt?: string; // No longer used but kept for type safety
  price?: number; // Price on the marketplace
  purchaseLink?: string; // Link to buy the image
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

export const apiGetUserStatus = (): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/user/status', { method: 'GET' });
};

export const apiActivateLicense = (email: string, key: string): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/license/activate', {
    method: 'POST',
    body: JSON.stringify({ email, key }),
  });
};

/**
 * Sends a client-generated image to the backend for permanent storage and
 * to trigger the new marketplace logic.
 * @param base64Image The base64-encoded image string.
 * @param prompt The original, user-entered prompt.
 * @param fullPrompt The complete, decorated prompt with all style modifiers.
 * @param width The image width.
 * @param height The image height.
 * @returns A promise that resolves with the full saved image record.
 */
export const apiSaveImage = (base64Image: string, prompt: string, fullPrompt: string, width: number, height: number): Promise<ImageRecord> => {
    return fetchApi<ImageRecord>('/images/save', {
        method: 'POST',
        body: JSON.stringify({ base64Image, prompt, fullPrompt, width, height }),
    });
};

/**
 * Fetches the user's private, non-expired generated image history.
 */
export const apiGetImageHistory = (): Promise<ImageRecord[]> => {
    return fetchApi<ImageRecord[]>('/images/history', { method: 'GET' });
};

/**
 * Fetches all images that are currently for sale on the marketplace.
 */
export const apiGetMarketplaceItems = (): Promise<ImageRecord[]> => {
    return fetchApi<ImageRecord[]>('/marketplace/list', { method: 'GET' });
};