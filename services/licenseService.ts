import { apiGetUserStatus, apiActivateLicense } from './apiService';
import { PLAN_DETAILS, PlanName } from '../config/plans';

// FIX: Re-export the PlanName type to make it available to other modules.
export type { PlanName };

// Interfaces remain the same, but the data source is now the backend.
export interface ActivatedLicense {
    key: string;
    email: string;
    planName: PlanName;
    creditsAdded: number;
    activationDate: string;
    expiresAt: string;
}

export interface UserStatus {
    name: string | null;
    email: string | null;
    plan: PlanName;
    credits: number;
    licenses: ActivatedLicense[];
    isGuest?: boolean; // Flag to easily identify guest users
}

const GUEST_CREDITS_KEY = 'seedream_guest_credits';
const INITIAL_GUEST_CREDITS = 500;


/**
 * Creates a default guest status object for users who are not logged in.
 * This is used as a fallback if the API call fails or if there's no session.
 */
export const createGuestStatus = (): UserStatus => {
    const freeTrialPlan = PLAN_DETAILS['FREE_TRIAL'];
    return {
        name: 'Guest',
        email: null,
        plan: freeTrialPlan.name,
        credits: INITIAL_GUEST_CREDITS,
        licenses: [],
        isGuest: true,
    };
};

/**
 * Gets the current guest status from local storage. Initializes if not present.
 */
export const getGuestStatus = (): UserStatus => {
    let creditsStr = localStorage.getItem(GUEST_CREDITS_KEY);
    if (creditsStr === null) {
        creditsStr = String(INITIAL_GUEST_CREDITS);
        localStorage.setItem(GUEST_CREDITS_KEY, creditsStr);
    }
    const credits = parseInt(creditsStr, 10);
    
    return {
        ...createGuestStatus(),
        credits: isNaN(credits) ? INITIAL_GUEST_CREDITS : credits,
    };
};

/**
 * Deducts credits from the guest's local storage balance.
 * @param amount The number of credits to deduct.
 * @returns The new credit balance.
 */
export const deductGuestCredits = (amount: number): number => {
    const currentStatus = getGuestStatus();
    const newCredits = Math.max(0, currentStatus.credits - amount);
    localStorage.setItem(GUEST_CREDITS_KEY, String(newCredits));
    return newCredits;
};


/**
 * Fetches the current user's status from the backend API.
 * This is now an asynchronous operation.
 * @returns A promise that resolves to the user's status.
 */
// FIX: Added token parameter to pass to the API service, resolving a missing argument error.
export const getLicensedUserStatus = async (token: string): Promise<UserStatus> => {
    const status = await apiGetUserStatus(token);
    return { ...status, isGuest: false };
};

/**
 * Sends a license activation request to the backend.
 * On success, it clears guest data from local storage.
 * @param email The email address used at checkout.
 * @param key The license key from Polar.sh.
 * @returns A promise that resolves to the user's new status.
 */
// FIX: Added token parameter to pass to the API service, resolving a missing argument error.
export const activateLicense = async (email: string, key: string, token: string): Promise<UserStatus> => {
    const newStatus = await apiActivateLicense(email, key, token);
    // User is no longer a guest, clear guest credits from local storage
    localStorage.removeItem(GUEST_CREDITS_KEY);
    return { ...newStatus, isGuest: false };
};

// FIX: Export the isLicenseExpired function to resolve the import error.
/**
 * Checks if a given license has expired.
 * @param license The license to check.
 * @returns True if the license has expired, false otherwise.
 */
export const isLicenseExpired = (license: ActivatedLicense): boolean => {
    if (!license.expiresAt) {
        return false;
    }
    const expirationDate = new Date(license.expiresAt);
    const now = new Date();
    return expirationDate < now;
};