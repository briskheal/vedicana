"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User as UserIcon, Key } from 'lucide-react';

function LoginForm({ onToggleForgot }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Login failed');

      if (typeof window !== 'undefined') {
        localStorage.setItem('vedicana_just_logged_in', 'true');
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {registered && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-6 text-center border border-green-100 font-medium animate-fade-in">
          Account created successfully! Please sign in.
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-6 text-center border border-red-100 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            required 
            name="email" 
            type="email" 
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <button 
              type="button"
              onClick={onToggleForgot}
              className="text-xs text-vedicana-gold hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <input 
            required 
            name="password" 
            type="password" 
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-vedicana-dark-green hover:bg-vedicana-green text-white rounded-md py-3 font-medium transition-colors shadow-md mt-4 disabled:opacity-70 cursor-pointer"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </>
  );
}

function ForgotForm({ onToggleLogin, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to request PIN');

      setMessage(json.message || 'A verification PIN has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (pin.length !== 6) {
      setError('Please enter the 6-digit PIN sent to your email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to reset password');

      onSuccess('Your password has been successfully reset! You can now log in.');
      onToggleLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-6 text-center border border-red-100 font-medium animate-fade-in">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md text-sm mb-6 text-center border border-emerald-100 font-medium animate-fade-in">
          {message}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestPin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Email Address</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-vedicana-green hover:bg-emerald-700 text-white rounded-md py-3 font-medium transition-colors shadow-md mt-2 disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Sending PIN...' : 'Send Reset PIN'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in-up">
          <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200 mb-2">
            <span className="text-xs text-gray-500 block mb-0.5">Resetting password for:</span>
            <span className="text-sm font-medium text-gray-900">{email}</span>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-vedicana-green ml-3 hover:underline">Change</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Verification PIN <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              maxLength={6}
              placeholder="Enter PIN from email"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none font-mono text-center tracking-widest text-lg" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
            <input 
              required 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
            <input 
              required 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-vedicana-green hover:bg-emerald-700 text-white rounded-md py-3 font-medium transition-colors shadow-md mt-4 disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Verifying & Resetting...' : 'Verify PIN & Reset Password'}
          </button>
        </form>
      )}

      <div className="text-center mt-5">
        <button 
          type="button" 
          onClick={onToggleLogin}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium hover:underline focus:outline-none"
        >
          Back to Sign In
        </button>
      </div>
    </>
  );
}

export default function Login() {
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="min-h-screen bg-[#f9f9fa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-vedicana-gold/10 rounded-full flex items-center justify-center text-vedicana-gold mx-auto mb-4">
            {view === 'login' ? <UserIcon size={32} /> : <Key size={32} />}
          </div>
          <h2 className="text-3xl font-serif text-gray-900 mb-2">
            {view === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h2>
          <p className="text-gray-500">
            {view === 'login' 
              ? 'Sign in to access your orders and profile.' 
              : 'Enter your registered email address to set a new password.'}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-6 text-center border border-green-100 font-medium animate-fade-in">
            {successMessage}
          </div>
        )}

        {view === 'login' ? (
          <Suspense fallback={<div className="text-center text-gray-500 py-4">Loading form...</div>}>
            <LoginForm 
              onToggleForgot={() => {
                setView('forgot');
                setSuccessMessage('');
              }} 
            />
          </Suspense>
        ) : (
          <ForgotForm 
            onToggleLogin={() => setView('login')} 
            onSuccess={(msg) => setSuccessMessage(msg)}
          />
        )}

        {view === 'login' && (
          <p className="mt-6 text-center text-sm text-gray-500">
            New to VediCana?{' '}
            <Link href="/register" className="text-vedicana-green font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
