
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { LicenseStatus, clearAnonymousStatus } from '../services/licenseService';

interface AuthContextType {
  user: LicenseStatus | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  activateLicense: (email: string, key: string) => Promise<LicenseStatus>;
  deductCredits: (amount: number) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LicenseStatus | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (jwt: string) => {
    try {
      const response = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
      if (response.ok) {
        const userData: LicenseStatus = await response.json();
        setUser(userData);
        setToken(jwt);
        localStorage.setItem('authToken', jwt);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error(error);
      logout();
    }
  }, []);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      fetchUserProfile(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('authToken', data.token);
    clearAnonymousStatus();
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    // After successful signup, log the user in
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };
  
  const activateLicense = async (email: string, key: string): Promise<LicenseStatus> => {
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, key }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Activation failed');
      
      // If the user activating is the current user, refresh their data
      if(user && user.email === email) {
          setUser(data);
      }
      return data;
  };

  const deductCredits = async (amount: number) => {
      if (!token) throw new Error("Authentication required.");
      const response = await fetch('/api/deduct-credits', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to deduct credits');
      setUser(data);
  };

  const refreshUser = () => {
      if(token) {
          fetchUserProfile(token);
      }
  };

  const value = { user, token, isLoading, login, signup, logout, activateLicense, deductCredits, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};