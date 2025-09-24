import { createClient } from '@vercel/kv';

export const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface LicenseStatus {
  name: string | null;
  plan: 'Free Trial' | 'Booster' | 'Premium' | 'Professional' | 'Loading...';
  credits: number;
  email: string | null;
  key?: string | null;
  planExpiryDate?: string | null;
  subscriptionStatus?: 'active' | 'expired' | 'free_trial' | null;
}

export interface UserData extends LicenseStatus {
    id: string;
    passwordHash?: string;
    resetToken?: string;
    resetTokenExpires?: number;
    imageHistory?: { id: string; imageUrl: string; prompt: string; createdAt: string }[];
}

const userKey = (email: string) => `user:${email.toLowerCase()}`;
const userIdKey = (id: string) => `userid:${id}`;
const orderKey = (orderId: string) => `order:${orderId}`;
const activationKey = (key: string) => `key-used:${key}`;
const activeSubscriptionsKey = 'active-subscriptions';
export const resetTokenKey = (token: string) => `reset-token:${token}`;

export const kvService = {
    // User Management
    async getUserByEmail(email: string): Promise<UserData | null> {
        return await kv.get(userKey(email));
    },
    async getUserById(id: string): Promise<UserData | null> {
        const email: string | null = await kv.get(userIdKey(id));
        if (!email) return null;
        return await this.getUserByEmail(email);
    },
    async createUser(data: Omit<UserData, 'id'> & { id?: string }): Promise<UserData> {
        const id = data.id || crypto.randomUUID();
        const userData: UserData = { ...data, id };
        const userEmail = userData.email!.toLowerCase();

        await kv.set(userKey(userEmail), userData);
        await kv.set(userIdKey(id), userEmail);
        return userData;
    },
    async updateUser(email: string, data: Partial<UserData>): Promise<UserData> {
        const user = await this.getUserByEmail(email);
        if (!user) throw new Error("User not found for update.");
        const updatedUser = { ...user, ...data };
        await kv.set(userKey(email), updatedUser);
        return updatedUser;
    },
    async findUserByResetToken(token: string): Promise<UserData | null> {
        const email: string | null = await kv.get(resetTokenKey(token));
        if (!email) {
            return null; // Token not found or expired
        }
        const user = await this.getUserByEmail(email);

        if (!user || user.resetToken !== token) {
            return null;
        }

        if (user.resetTokenExpires && user.resetTokenExpires < Date.now()) {
            return null;
        }

        return user;
    },

    // Order/Key Management
    async isOrderProcessed(orderId: string): Promise<boolean> {
        return (await kv.get(orderKey(orderId))) === 1;
    },
    async markOrderAsProcessed(orderId: string): Promise<void> {
        await kv.set(orderKey(orderId), 1, { ex: 86400 * 45 }); // Expire after 45 days
    },
    async isKeyUsed(key: string): Promise<boolean> {
        return (await kv.get(activationKey(key))) === 1;
    },
    async markKeyAsUsed(key: string): Promise<void> {
        await kv.set(activationKey(key), 1, { ex: 86400 * 45 }); // Expire after 45 days
    },

    // Subscription Management
    async addActiveSubscriber(email: string): Promise<void> {
        await kv.sadd(activeSubscriptionsKey, email.toLowerCase());
    },
    async removeActiveSubscriber(email: string): Promise<void> {
        await kv.srem(activeSubscriptionsKey, email.toLowerCase());
    },
    async getActiveSubscribers(): Promise<string[]> {
        return await kv.smembers(activeSubscriptionsKey);
    }
};