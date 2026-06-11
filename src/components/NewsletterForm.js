"use client";
import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe. Please try again.');
      }

      setSuccessMessage(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address" 
          className="flex-grow px-6 py-4 rounded-md focus:outline-none focus:ring-2 focus:ring-vedicana-gold bg-white text-gray-900 placeholder-gray-500 text-sm md:text-base border border-slate-800"
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !email.trim()}
          className="bg-vedicana-gold hover:bg-[#e69d00] disabled:opacity-50 text-slate-950 px-8 py-4 rounded-md font-bold transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
            </>
          ) : 'Subscribe'}
        </button>
      </form>

      {/* Success alert message */}
      {successMessage && (
        <div className="mt-4 bg-emerald-500/20 border border-emerald-400 text-emerald-300 p-4 rounded-md text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error alert message */}
      {errorMessage && (
        <div className="mt-4 bg-red-500/20 border border-red-400 text-red-300 p-4 rounded-md text-sm flex items-center gap-2 shadow-lg">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
