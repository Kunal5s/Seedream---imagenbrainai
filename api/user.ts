import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvService, UserData, LicenseStatus } from '../services/kvService';
import { verifyToken } from '../services/authService';
import { PLAN_DETAILS, getKeyPrefixToPlan } from '../config/plans';

const handleGetProfile = async (res: VercelResponse, user: UserData) => {
    const responseData: LicenseStatus = { name: user.name, email: user.email, plan: user.plan, credits: user.credits, key: user.key, planExpiryDate: user.planExpiryDate, subscriptionStatus: user.subscriptionStatus };
    return res.status(200).json(responseData);
};

const handleDeductCredits = async (req: VercelRequest, res: VercelResponse, user: UserData) => {
    const { amountOfImages } = req.body;
    if (!amountOfImages || typeof amountOfImages !== 'number') return res.status(400).json({ message: 'Amount of images is required.' });

    if (user.plan !== 'Free Trial' && user.subscriptionStatus !== 'active') {
        const isExpired = !user.planExpiryDate || new Date(user.planExpiryDate) < new Date();
        if (isExpired) {
            return res.status(403).json({ message: 'Your plan has expired. Please renew to continue.' });
        }
    }
    
    const planKey = Object.keys(PLAN_DETAILS).find(k => PLAN_DETAILS[k].planName === user.plan) || 'FREE_TRIAL';
    const creditsPerImage = PLAN_DETAILS[planKey].creditsPerImage;
    const totalCost = amountOfImages * creditsPerImage;

    if ((user.credits || 0) < totalCost) return res.status(402).json({ message: 'Insufficient credits.' });
    
    const updatedUser = await kvService.updateUser(user.email!, { credits: (user.credits || 0) - totalCost });
    const responseData: LicenseStatus = { name: updatedUser.name, email: updatedUser.email, plan: updatedUser.plan, credits: updatedUser.credits, key: updatedUser.key, planExpiryDate: updatedUser.planExpiryDate, subscriptionStatus: updatedUser.subscriptionStatus };
    return res.status(200).json(responseData);
};

const handleActivateKey = async (req: VercelRequest, res: VercelResponse) => {
    const { email, key } = req.body;
    if (!email || !key) return res.status(400).json({ message: 'Email and key are required.' });

    const newPlanName = getKeyPrefixToPlan(key);
    if (!newPlanName) return res.status(400).json({ message: 'Invalid activation key format.' });
    
    const planDetails = Object.values(PLAN_DETAILS).find(p => p.planName === newPlanName);
    if (!planDetails) return res.status(400).json({ message: 'Invalid plan key.' });

    const user = await kvService.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'No account found for this email. Please sign up first.' });

    const isKeyUsed = await kvService.isKeyUsed(key);
    if(isKeyUsed) return res.status(409).json({ message: 'This activation key has already been used.' });

    const newCredits = (user.credits || 0) + planDetails.credits;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const updatedUser = await kvService.updateUser(email, {
        plan: planDetails.planName,
        credits: newCredits,
        key: key,
        subscriptionStatus: 'active',
        planExpiryDate: expiryDate.toISOString(),
    });
    
    await kvService.markKeyAsUsed(key);
    await kvService.addActiveSubscriber(email);
    
    const responseData: LicenseStatus = { name: updatedUser.name, email: updatedUser.email, plan: updatedUser.plan, credits: updatedUser.credits, key: updatedUser.key, planExpiryDate: updatedUser.planExpiryDate, subscriptionStatus: updatedUser.subscriptionStatus };
    return res.status(200).json(responseData);
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    if (req.method === 'POST' && action === 'activate-key') {
        try { return await handleActivateKey(req, res); } catch (error) {
            console.error(`Error in user handler (action: activate-key):`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token.' });
    
    try {
        const user = await kvService.getUserById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (req.method === 'GET' && action === 'get-profile') {
            return await handleGetProfile(res, user);
        }
        if (req.method === 'POST' && action === 'deduct-credits') {
            return await handleDeductCredits(req, res, user);
        }
        
        return res.status(400).json({ message: 'Invalid action or method.' });

    } catch (error) {
        console.error(`Error in user handler (action: ${action}):`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}