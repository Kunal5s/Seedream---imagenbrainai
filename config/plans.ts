// config/plans.ts
// The import from `../services/licenseService.ts` has been removed because the file is now obsolete.
// A local `PlanName` type is defined to provide type safety for the plan-related constants.

export type PlanName = 'Free Trial' | 'Booster' | 'Premium' | 'Professional';

export const PLAN_DETAILS: Record<string, { planName: PlanName, credits: number, creditsPerImage: number }> = {
    'FREE_TRIAL': { planName: 'Free Trial', credits: 500, creditsPerImage: 5 },
    'polar_cl_dxRr7iGKWfMzpHYZlFGd5tY18ICJM30sDgGf80Y0dCj': { planName: 'Booster', credits: 5000, creditsPerImage: 4 },
    'polar_cl_lTBWXKtStKOn44M16Qpb2LdlE1YC7OaxWNDDo4RTpge': { planName: 'Premium', credits: 15000, creditsPerImage: 3 },
    'polar_cl_SrTKX1rcDoCW5jAoj4lZsmqnwNoocvi8oGZLu4WmoMa': { planName: 'Professional', credits: 30000, creditsPerImage: 2 },
};
