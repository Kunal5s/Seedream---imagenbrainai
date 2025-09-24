// config/plans.ts
// FIX: The import from `../services/licenseService.ts` was removed because the file is not a module.
// A local `PlanName` type is defined instead to provide type safety for the plan-related constants and functions.
import type { LicenseStatus } from '../services/licenseService';

export type PlanName = 'Free Trial' | 'Booster' | 'Premium' | 'Professional';

export const PLAN_DETAILS: Record<string, { planName: PlanName, credits: number, creditsPerImage: number }> = {
    'FREE_TRIAL': { planName: 'Free Trial', credits: 500, creditsPerImage: 5 },
    'polar_cl_dxRr7iGKWfMzpHYZlFGd5tY18ICJM30sDgGf80Y0dCj': { planName: 'Booster', credits: 5000, creditsPerImage: 4 },
    'polar_cl_lTBWXKtStKOn44M16Qpb2LdlE1YC7OaxWNDDo4RTpge': { planName: 'Premium', credits: 15000, creditsPerImage: 3 },
    'polar_cl_SrTKX1rcDoCW5jAoj4lZsmqnwNoocvi8oGZLu4WmoMa': { planName: 'Professional', credits: 30000, creditsPerImage: 2 },
};

export const getKeyPrefixToPlan = (key: string): PlanName | null => {
    const upperKey = key.toUpperCase();
    if (upperKey.startsWith('BOOST-')) return 'Booster';
    if (upperKey.startsWith('PREM-')) return 'Premium';
    if (upperKey.startsWith('PRO-')) return 'Professional';
    return null;
};
