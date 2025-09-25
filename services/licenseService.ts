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
}

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
        credits: freeTrialPlan.credits,
        licenses: [],
    };
};

/**
 * Fetches the current user's status from the backend API.
 * This is now an asynchronous operation.
 * @returns A promise that resolves to the user's status.
 */
export const getLicensedUserStatus = async (): Promise<UserStatus> => {
    try {
        const status = await apiGetUserStatus();
        return status;
    } catch (error) {
        console.warn("Could not fetch user status, defaulting to guest.", error);
        // If the API fails (e.g., user not logged in), return a guest status.
        return createGuestStatus();
    }
};

/**
 * Sends a license activation request to the backend.
 * This is now an asynchronous operation.
 * @param email The email address used at checkout.
 * @param key The license key from Polar.sh.
 * @returns A promise that resolves to the user's new status.
 */
export const activateLicense = async (email: string, key: string): Promise<UserStatus> => {
    // The API call handles validation and state updates on the server.
    return await apiActivateLicense(email, key);
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
