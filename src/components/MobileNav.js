"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav({ discoverPages = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden flex items-center ml-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-700 hover:text-vedicana-green p-2 transition-colors focus:outline-none"
        aria-label="Open Mobile Menu"
      >
        <Menu size={28} />
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <span className="text-2xl font-serif font-bold text-vedicana-green tracking-tight">
                VediCana<span className="text-vedicana-gold text-3xl leading-none">.</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col py-6 px-4 space-y-2">
              <Link href="/" className="px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors">
                Home
              </Link>
              <Link href="/shop" className="px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors">
                Shop
              </Link>
              <Link href="/blog" className="px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors">
                Blog
              </Link>
              
              {/* Discover Accordion */}
              <div className="flex flex-col">
                <button 
                  onClick={() => setDiscoverOpen(!discoverOpen)}
                  className="flex items-center justify-between px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors"
                >
                  Discover
                  {discoverOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {discoverOpen && (
                  <div className="flex flex-col pl-8 pr-4 py-2 space-y-1 bg-gray-50/50 rounded-b-xl border-l-2 border-vedicana-green/20 ml-2">
                    <Link href="/prakriti" className="py-2 text-sm font-semibold text-vedicana-gold hover:text-vedicana-green">
                      Ayurvedic Quiz (Prakriti)
                    </Link>
                    {discoverPages.map((page) => (
                      <Link key={page.id} href={`/${page.slug}`} className="py-2 text-sm font-medium text-gray-600 hover:text-vedicana-green">
                        {page.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/contact" className="px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors">
                Contact Us
              </Link>
              <Link href="/career" className="px-4 py-3 text-lg font-bold text-gray-800 hover:bg-gray-50 hover:text-vedicana-green rounded-xl transition-colors">
                Careers
              </Link>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100 bg-gray-50">
              <Link 
                href="/wellness-consultation" 
                className="w-full block text-center bg-vedicana-green hover:bg-vedicana-dark-green text-white py-3.5 rounded-xl font-bold tracking-wide transition-colors"
              >
                Wellness Consultation
              </Link>
              <div className="flex justify-center mt-6 space-x-6">
                <Link href="/profile" className="text-gray-500 hover:text-vedicana-green">
                  Account
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/cart" className="text-gray-500 hover:text-vedicana-green">
                  Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
