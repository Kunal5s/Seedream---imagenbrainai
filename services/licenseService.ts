export interface LicenseStatus {
  name: string | null;
  plan: 'Free Trial' | 'Booster' | 'Premium' | 'Professional' | 'Loading...';
  credits: number;
  email: string | null;
  key?: string | null;
  planExpiryDate?: string | null;
  subscriptionStatus?: 'active' | 'expired' | 'free_trial' | null;
}

const ANONYMOUS_USER_KEY = 'anonymousUserStatus';
const FREE_TRIAL_CREDITS = 500;

// --- Local Storage Functions for Anonymous Users ---

/**
 * Gets the status for an anonymous (not logged in) user from local storage.
 * If no status exists, it creates a new free trial status.
 * @returns {LicenseStatus} The anonymous user's current status.
 */
export const getAnonymousStatus = (): LicenseStatus => {
    try {
        const storedStatus = localStorage.getItem(ANONYMOUS_USER_KEY);
        if (storedStatus) {
            return JSON.parse(storedStatus);
        }
    } catch (error) {
        console.error("Could not parse anonymous user status:", error);
    }
    // Default status for a new anonymous user
    const defaultStatus: LicenseStatus = {
        name: 'Guest',
        plan: 'Free Trial',
        credits: FREE_TRIAL_CREDITS,
        email: null,
        subscriptionStatus: 'free_trial',
    };
    localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(defaultStatus));
    return defaultStatus;
};

/**
 * Deducts credits for an anonymous user and updates local storage.
 * @param {number} amount - The number of credits to deduct.
 * @returns {LicenseStatus} The anonymous user's new status.
 */
export const deductAnonymousCredits = (amount: number): LicenseStatus => {
    const currentStatus = getAnonymousStatus();
    if (currentStatus.credits < amount) {
        throw new Error("Not enough credits for this action.");
    }
    const newStatus: LicenseStatus = {
        ...currentStatus,
        credits: currentStatus.credits - amount
    };
    localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(newStatus));
    return newStatus;
};

/**
 * Clears anonymous user data. This is useful when a user signs up.
 */
export const clearAnonymousStatus = (): void => {
    localStorage.removeItem(ANONYMOUS_USER_KEY);
};