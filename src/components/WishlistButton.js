"use client";
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'vc_guest_wishlist';

function getGuestWishlist() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function setGuestWishlist(ids) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function WishlistButton({ productId, className = '' }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  // On mount: check API, fallback to localStorage
  useEffect(() => {
    fetch('/api/wishlist')
      .then(r => {
        if (r.ok) {
          setIsAuth(true);
          return r.json();
        }
        throw new Error('Guest');
      })
      .then(data => {
        if (Array.isArray(data)) setWishlisted(data.some(i => i.productId === productId));
        setSynced(true);
      })
      .catch(() => {
        setIsAuth(false);
        const guestList = getGuestWishlist();
        setWishlisted(guestList.includes(productId));
        setSynced(true);
      });
  }, [productId]);
  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuth) {
      // Toggle in localStorage
      const guestList = getGuestWishlist();
      if (guestList.includes(productId)) {
        const updated = guestList.filter(id => id !== productId);
        setGuestWishlist(updated);
        setWishlisted(false);
      } else {
        const updated = [...guestList, productId];
        setGuestWishlist(updated);
        setWishlisted(true);
        // Show a toast-style hint to log in
        if (typeof window !== 'undefined') {
          const el = document.createElement('div');
          el.textContent = '❤️ Saved! Login to keep your wishlist permanently.';
          el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a3c2b;color:#fff;padding:10px 20px;border-radius:9999px;font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
          document.body.appendChild(el);
          setTimeout(() => document.body.removeChild(el), 3000);
        }
      }
      return;
    }

    // Logged in — hit API
    setLoading(true);
    try {
      if (wishlisted) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        setWishlisted(false);
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        setWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!synced) return null; // Avoid hydration mismatch

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`group flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 hover:scale-110 transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      <Heart
        size={16}
        className={`transition-colors duration-200 ${wishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-400 group-hover:text-rose-400'}`}
        fill={wishlisted ? 'currentColor' : 'none'}
      />
    </button>
  );
}

// Utility: call this after login to sync localStorage wishlist to the server
export async function syncGuestWishlistToServer() {
  const guestList = getGuestWishlist();
  if (!guestList.length) return;
  try {
    await Promise.all(
      guestList.map(productId =>
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      )
    );
    setGuestWishlist([]); // Clear after sync
  } catch (err) {
    console.error('Wishlist sync error:', err);
  }
}
