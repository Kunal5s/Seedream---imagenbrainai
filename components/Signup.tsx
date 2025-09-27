// components/Signup.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';
import GoogleIcon from './ui/GoogleIcon';

interface SignupProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
        await signInWithGoogle();
        onSuccess();
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to sign up with Google.');
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-[450px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center mb-2 text-green-300">Create an Account</h2>
      <p className="text-center text-gray-400 mb-6 text-sm">Join to start your creative journey.</p>
      
      {error && <p className="text-red-400 text-center bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>}
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5" />
        </div>
        <div>
          <label htmlFor="signup-password_" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input type="password" id="signup-password_" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
          <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5" />
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400">Sign Up</button>
        </div>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-700" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-gray-900 px-2 text-gray-500">OR</span></div>
      </div>
      
       <button onClick={handleGoogleSignUp} className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white font-bold py-3 rounded-lg border border-gray-600 hover:bg-white/10">
          <GoogleIcon className="w-5 h-5" />
          Sign Up with Google
       </button>

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-green-300 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default Signup;
