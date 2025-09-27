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
  price?: number; // Price on the marketplace
  purchaseLink?: string; // Link to buy the image
  marketplaceStatus?: 'private' | 'live';
  title?: string; // Engaging title from Gemini
  description?: string; // Detailed description from Gemini
}

export interface PollinationBundle {
  id: string;
  title: string;
  description: string;
  price: number; // in cents
  imageUrls: string[];
  purchaseLink: string;
  createdAt: string;
  polarProductId: string;
}


// A generic helper function to handle fetch requests and standardized error handling.
async function fetchApi<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  try {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API Error: ${response.statusText}` }));
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

export const apiGetUserStatus = (token: string): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/user/status', { method: 'GET' }, token);
};

export const apiActivateLicense = (email: string, key: string, token: string): Promise<UserStatus> => {
  return fetchApi<UserStatus>('/license/activate', {
    method: 'POST',
    body: JSON.stringify({ email, key }),
  }, token);
};

/**
 * Sends a client-generated image to the backend for permanent storage and handles credit deduction if necessary.
 * Used by both free and premium generators.
 */
export const apiSaveImage = (
  base64Image: string, 
  prompt: string, 
  fullPrompt: string, 
  width: number, 
  height: number, 
  isPremium: boolean,
  token?: string | null
): Promise<{ savedRecord: ImageRecord, credits: number }> => {
    return fetchApi<{ savedRecord: ImageRecord, credits: number }>('/images/save', {
        method: 'POST',
        body: JSON.stringify({ base64Image, prompt, fullPrompt, width, height, isPremium }),
    }, token || undefined);
};

/**
 * Fetches the user's private, non-expired generated image history.
 */
export const apiGetImageHistory = (token: string): Promise<ImageRecord[]> => {
    return fetchApi<ImageRecord[]>('/images/history', { method: 'GET' }, token);
};

/**
 * Fetches all images that are currently for sale on the marketplace.
 */
export const apiGetMarketplaceItems = (): Promise<ImageRecord[]> => {
    return fetchApi<ImageRecord[]>('/marketplace/list', { method: 'GET' });
};

/**
 * Fetches the daily curated Pollinations AI art bundles.
 */
export const apiGetPollinationsBundles = (): Promise<PollinationBundle[]> => {
    return fetchApi<PollinationBundle[]>('/marketplace/pollinations');
};

/**
 * Creates a dynamic Polar.sh checkout session for a list of bundle IDs.
 */
export const apiCreateCheckoutSession = (bundleIds: string[]): Promise<{ checkoutUrl: string }> => {
    return fetchApi<{ checkoutUrl: string }>('/marketplace/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ bundleIds }),
    });
};


/**
 * Fetches the secure download link for a completed order.
 */
export const apiGetDownloadLinkForOrder = (orderId: string): Promise<{ downloadUrl: string | null }> => {
    return fetchApi<{ downloadUrl: string | null }>(`/marketplace/get-download-link?orderId=${orderId}`);
};