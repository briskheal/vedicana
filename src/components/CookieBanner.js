"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vc_cookie_consent');
    if (!consent) {
      // Small delay to not overwhelm immediately on load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vc_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('vc_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto transform transition-all translate-y-0 opacity-100">
        
        <div className="flex-1">
          <h3 className="text-gray-900 font-bold text-sm mb-1 flex items-center gap-2">
            🍪 We value your privacy
          </h3>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic in accordance with the DPDP Act 2023. By clicking "Accept All", you consent to our use of cookies. 
            <Link href="/privacy-policy" className="text-vedicana-green hover:underline ml-1 font-medium">Read our Privacy Policy.</Link>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-5 py-2.5 text-xs font-bold text-white bg-vedicana-green hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            Accept All
          </button>
          <button 
            onClick={() => setIsVisible(false)} 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors hidden md:block"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
