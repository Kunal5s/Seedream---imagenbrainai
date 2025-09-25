// config/plans.ts
export type PlanName = 'Free Trial' | 'Booster' | 'Premium' | 'Professional';

export interface Plan {
  id: string;
  name: PlanName;
  price: string;
  for: string;
  link?: string;
  features: string[];
  credits: number;
  creditsPerImage: number;
  isHighlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'FREE_TRIAL',
    name: 'Free Trial',
    price: '$0',
    for: 'Start Your Creative Journey',
    isHighlighted: true,
    features: [
      '500 Initial Credits',
      '5 Credits per Image',
      'Standard Generation Speed',
      'Community Support'
    ],
    credits: 500,
    creditsPerImage: 5,
  },
  {
    id: 'polar_cl_dxRr7iGKWfMzpHYZlFGd5tY18ICJM30sDgGf80Y0dCj',
    name: 'Booster',
    price: '$20',
    for: 'For Power Users',
    link: 'https://buy.polar.sh/polar_cl_dxRr7iGKWfMzpHYZlFGd5tY18ICJM30sDgGf80Y0dCj',
    features: [
      '5,000 Credits',
      'Commercial License',
      'Priority Support',
    ],
    credits: 5000,
    creditsPerImage: 4,
  },
  {
    id: 'polar_cl_lTBWXKtStKOn44M16Qpb2LdlE1YC7OaxWNDDo4RTpge',
    name: 'Premium',
    price: '$50',
    for: 'For Professionals',
    link: 'https://buy.polar.sh/polar_cl_lTBWXKtStKOn44M16Qpb2LdlE1YC7OaxWNDDo4RTpge',
    features: [
      '15,000 Credits',
      'Advanced API Access (Coming Soon)',
      'Custom Style Training (Coming Soon)',
    ],
    credits: 15000,
    creditsPerImage: 3,
  },
  {
    id: 'polar_cl_SrTKX1rcDoCW5jAoj4lZsmqnwNoocvi8oGZLu4WmoMa',
    name: 'Professional',
    price: '$100',
    for: 'For Enterprises',
    link: 'https://buy.polar.sh/polar_cl_SrTKX1rcDoCW5jAoj4lZsmqnwNoocvi8oGZLu4WmoMa',
    features: [
      '30,000 Credits',
      'Dedicated Account Manager',
      'Custom AI Models',
    ],
    credits: 30000,
    creditsPerImage: 2,
  },
];

export const PLAN_DETAILS: Record<string, Plan> = PLANS.reduce((acc, plan) => {
    acc[plan.id] = plan;
    return acc;
}, {} as Record<string, Plan>);
