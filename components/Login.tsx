// components/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';
import GoogleIcon from './ui/GoogleIcon';

interface LoginProps {
  onSwitchToSignup: () => void;
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
        await signInWithGoogle();
        onSuccess();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to sign in with Google.');
    } finally {
        setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="p-8 min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-2 text-green-300">Welcome Back</h2>
      <p className="text-center text-gray-400 mb-6 text-sm">Sign in to access your account and credits.</p>
      
      {error && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input type="email" id="login-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5" />
        </div>
        <div>
          <label htmlFor="login-password_" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input type="password" id="login-password_" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5" />
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400">Sign In</button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-900 px-2 text-gray-500">OR</span>
        </div>
      </div>

       <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-white/10">
            <GoogleIcon className="w-5 h-5" />
            Sign In with Google
        </button>

      <p className="text-center text-sm text-gray-400 mt-6">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="font-semibold text-green-300 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
