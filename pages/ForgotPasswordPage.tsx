
import React, { useState } from 'react';
import * as ReactRouterDom from 'react-router-dom';
import Button from '../components/ui/Button';
import MetaTags from '../components/MetaTags';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);
        try {
            const response = await fetch('/api/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send reset link.');
            
            setMessage(data.message);
            if(data.resetLink) {
                // In a real app, an email is sent. Here we display the link for testing.
                setMessage(data.message + `\n\n--- FOR TESTING ---\nReset Link: ${data.resetLink}`);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <MetaTags title="Forgot Password | Seedream ImagenBrainAi" description="Reset your password for Seedream ImagenBrainAi." canonicalPath="/forgot-password" />
            <div className="max-w-md mx-auto">
                <div className="bg-gray-900/50 border border-green-400/20 rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center text-green-300 mb-4">Forgot Password</h1>
                    <p className="text-center text-gray-400 mb-6">Enter your email and we'll send you a link to reset your password.</p>
                    
                    {message ? (
                        <div className="text-center p-4 bg-green-900/30 rounded-lg">
                           <p className="text-green-200 whitespace-pre-wrap">{message}</p>
                           <ReactRouterDom.Link to="/login" className="font-semibold text-green-300 hover:text-green-200 mt-4 inline-block">
                                &larr; Back to Sign In
                            </ReactRouterDom.Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;
