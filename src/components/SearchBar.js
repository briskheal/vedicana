'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-700 hover:text-vedicana-green transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Search remedies"
      >
        <Search size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-start justify-center pt-28 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-150 p-6 relative">
            {/* Close button */}
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 text-center">
              Search VediCana Remedies
            </h3>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Ghee, Tulsi, Stevia, Oil..." 
                  className="w-full bg-gray-50 border border-gray-250 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green transition-all text-sm font-sans"
                />
              </div>
              <button 
                type="submit" 
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-sans text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-xl cursor-pointer shadow-md transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
