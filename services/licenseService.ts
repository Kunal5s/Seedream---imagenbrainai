export interface LicenseStatus {
  plan: 'Free Trial' | 'Booster' | 'Premium' | 'Professional';
  credits: number;
  email: string | null;
  key: string | null;
}

const STORAGE_KEY = 'imagenBrainLicense';

const PLAN_CREDITS = {
  'Booster': 5000,
  'Premium': 15000,
  'Professional': 30000,
};

/**
 * Retrieves the current license status from localStorage.
 * If no status is found, it initializes a new Free Trial status.
 * @returns {LicenseStatus} The user's current license status.
 */
export const getLicenseStatus = (): LicenseStatus => {
  try {
    const storedStatus = localStorage.getItem(STORAGE_KEY);
    if (storedStatus) {
      const parsed = JSON.parse(storedStatus) as LicenseStatus;
      // Basic validation
      if (typeof parsed.plan === 'string' && typeof parsed.credits === 'number') {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to parse license status from localStorage:", error);
  }

  // Default to a new Free Trial if nothing is stored or data is corrupt
  const freeTrialStatus: LicenseStatus = {
    plan: 'Free Trial',
    credits: 500,
    email: null,
    key: null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(freeTrialStatus));
  return freeTrialStatus;
};

/**
 * Saves the provided license status to localStorage.
 * @param {LicenseStatus} status - The license status object to save.
 */
const saveLicenseStatus = (status: LicenseStatus): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
};

/**
 * Activates a license key, updates the user's plan and credits, and saves to localStorage.
 * This is a simulation and checks the key prefix to determine the plan.
 * @param {string} email - The user's email address.
 * @param {string} key - The activation key provided by the user.
 * @returns {Promise<LicenseStatus>} A promise that resolves to the new license status.
 * @throws {Error} If the activation key is invalid.
 */
export const activateLicense = (email: string, key: string): LicenseStatus => {
  const upperCaseKey = key.trim().toUpperCase();
  let newPlan: 'Booster' | 'Premium' | 'Professional' | null = null;

  if (upperCaseKey.startsWith('BOOST-')) {
    newPlan = 'Booster';
  } else if (upperCaseKey.startsWith('PREM-')) {
    newPlan = 'Premium';
  } else if (upperCaseKey.startsWith('PRO-')) {
    newPlan = 'Professional';
  }

  if (!newPlan) {
    throw new Error('Invalid activation key format. Please check your key and try again.');
  }

  const newStatus: LicenseStatus = {
    plan: newPlan,
    credits: PLAN_CREDITS[newPlan],
    email: email.trim(),
    key: key.trim(),
  };

  saveLicenseStatus(newStatus);
  return newStatus;
};

/**
 * Deducts a specified amount of credits from the user's balance.
 * @param {number} amount - The number of credits to deduct.
 * @returns {LicenseStatus} The updated license status after deduction.
 * @throws {Error} If there are not enough credits.
 */
export const deductCredits = (amount: number): LicenseStatus => {
  const currentStatus = getLicenseStatus();
  
  if (currentStatus.credits < amount) {
    throw new Error('Insufficient credits for this action.');
  }

  const newStatus: LicenseStatus = {
    ...currentStatus,
    credits: currentStatus.credits - amount,
  };

  saveLicenseStatus(newStatus);
  return newStatus;
};