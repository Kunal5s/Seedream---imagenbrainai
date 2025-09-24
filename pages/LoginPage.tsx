import React, { useState } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import MetaTags from '../components/MetaTags';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.648-3.657-11.303-8.653l-6.571 4.819C9.656 39.663 16.318 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C39.999 35.536 44 28.616 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = ReactRouterDom.useNavigate();
    const location = ReactRouterDom.useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleGoogleSignIn = () => {
        // This is a placeholder. A full implementation would use a library like @react-oauth/google
        // which would call `fetch('/api/auth?action=google', ...)` on success.
        alert("To enable Google Sign-In, please add the '@react-oauth/google' library and your Google Client ID to the Vercel environment variables as 'GOOGLE_CLIENT_ID'.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <MetaTags title="Login | Seedream ImagenBrainAi" description="Sign in to your Seedream ImagenBrainAi account." canonicalPath="/login" />
            <div className="max-w-md mx-auto">
                <div className="bg-gray-900/50 border border-green-400/20 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center text-green-300 mb-4">Sign In</h1>
                    <p className="text-center text-gray-400 mb-6">Welcome back! Access your account.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between items-center">
                                <label htmlFor="password"className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <ReactRouterDom.Link to="/forgot-password" className="text-xs text-green-400 hover:text-green-300">Forgot Password?</ReactRouterDom.Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                    
                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-gray-700" />
                        <span className="px-4 text-gray-500 text-sm">OR</span>
                        <hr className="flex-grow border-gray-700" />
                    </div>

                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90">
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <ReactRouterDom.Link to="/signup" className="font-semibold text-green-300 hover:text-green-200">
                            Sign Up
                        </ReactRouterDom.Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default LoginPage;