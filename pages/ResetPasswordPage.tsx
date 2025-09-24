import React, { useState } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import Button from '../components/ui/Button';
import MetaTags from '../components/MetaTags';

const ResetPasswordPage: React.FC = () => {
    const { token } = ReactRouterDom.useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setError(null);
        setMessage(null);
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth?action=reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reset password.');
            setMessage(data.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <MetaTags title="Reset Password | Seedream ImagenBrainAi" description="Set a new password for your account." canonicalPath="/reset-password" />
            <div className="max-w-md mx-auto">
                <div className="bg-gray-900/50 border border-green-400/20 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center text-green-300 mb-4">Reset Your Password</h1>
                    <p className="text-center text-gray-400 mb-6">Enter a new password for your account.</p>
                    
                    {message ? (
                         <div className="text-center p-4 bg-green-900/30 rounded-lg">
                           <p className="text-green-200">{message}</p>
                           <ReactRouterDom.Link to="/login" className="font-semibold text-green-300 hover:text-green-200 mt-4 inline-block">
                                Proceed to Sign In &rarr;
                            </ReactRouterDom.Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-colors"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;