"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function Register() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let token = '';
      if (executeRecaptcha) {
        token = await executeRecaptcha('register');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken: token }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Registration failed');

      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f8ef] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 sm:w-[400px] h-72 sm:h-[400px] max-w-full bg-vedicana-light-green opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-vedicana-green/10 rounded-full flex items-center justify-center text-vedicana-green mx-auto mb-3">
            <Leaf size={28} />
          </div>
          <h2 className="text-3xl font-serif text-gray-900 mb-1">Join VediCana</h2>
          <p className="text-gray-500 text-sm">Create your account with your billing profile for a seamless checkout experience.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-6 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Identity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">First Name <span className="text-red-500">*</span></label>
              <input required name="firstName" type="text" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name <span className="text-red-500">*</span></label>
              <input required name="lastName" type="text" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address <span className="text-red-500">*</span></label>
              <input required name="email" type="email" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input required name="phone" type="tel" placeholder="e.g. +91 98765 43210" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
          </div>

          {/* Address Line */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Street Address <span className="text-red-500">*</span></label>
            <input required name="address" placeholder="House number and street name" type="text" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Town / City <span className="text-red-500">*</span></label>
              <input required name="city" type="text" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State <span className="text-red-500">*</span></label>
              <select required name="state" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none bg-white text-gray-700">
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pincode / Postcode <span className="text-red-500">*</span></label>
              <input required name="pincode" type="text" className="w-full border border-gray-300 rounded-md px-3.5 py-2 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input required name="password" type={showPassword ? "text" : "password"} minLength={6} className="w-full border border-gray-300 rounded-md px-3.5 py-2 pr-10 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input required name="confirmPassword" type={showConfirmPassword ? "text" : "password"} minLength={6} className="w-full border border-gray-300 rounded-md px-3.5 py-2 pr-10 text-sm focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green focus:outline-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-vedicana-green hover:bg-emerald-700 text-white rounded-md py-3 font-medium transition-colors shadow-md mt-6 disabled:opacity-70 cursor-pointer uppercase tracking-wider text-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-vedicana-green font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
