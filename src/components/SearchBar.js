'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (query.trim().length >= 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSearching(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setResults({ products: [], categories: [] });
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const closeAndNavigate = () => {
    setIsOpen(false);
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-150 overflow-hidden relative flex flex-col max-h-[85vh]">
            
            {/* Header & Input */}
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
              <Search className="text-vedicana-green flex-shrink-0" size={24} />
              <form onSubmit={handleSearchSubmit} className="flex-grow">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for remedies, ingredients, categories..." 
                  className="w-full bg-transparent border-none text-gray-900 text-lg sm:text-xl placeholder:text-gray-400 focus:outline-none focus:ring-0 font-serif"
                  aria-label="Search query"
                />
              </form>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close search overlay"
              >
                <X size={24} />
              </button>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto flex-grow bg-gray-50/50">
              {query.length < 2 && (
                <div className="p-8 text-center text-gray-500 font-sans text-sm">
                  Start typing to see quick suggestions...
                </div>
              )}
              
              {query.length >= 2 && isSearching && results.products.length === 0 && (
                <div className="p-12 flex justify-center items-center text-vedicana-green">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              )}

              {query.length >= 2 && !isSearching && results.products.length === 0 && results.categories.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-sans">
                  No results found for &ldquo;<span className="text-gray-900 font-medium">{query}</span>&rdquo;
                </div>
              )}

              {(results.products.length > 0 || results.categories.length > 0) && (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  
                  {/* Products Column */}
                  <div className="sm:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Products</h4>
                    <div className="space-y-4">
                      {results.products.map(product => (
                        <Link 
                          key={product.id} 
                          href={`/shop/${product.slug}`}
                          onClick={closeAndNavigate}
                          className="flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Search size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-serif text-gray-900 group-hover:text-vedicana-green transition-colors font-medium text-sm sm:text-base line-clamp-1">{product.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-vedicana-green">₹{product.sale_price || product.price}</span>
                              {product.sale_price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Categories Column */}
                  {results.categories.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Categories</h4>
                      <div className="space-y-2">
                        {results.categories.map(cat => (
                          <Link 
                            key={cat.id} 
                            href={`/shop?category=${cat.slug}`}
                            onClick={closeAndNavigate}
                            className="block py-2 text-sm text-gray-600 hover:text-vedicana-green font-medium transition-colors border-b border-gray-100 last:border-0"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                </div>
              )}
            </div>

            {/* Footer */}
            {query.length >= 2 && (results.products.length > 0 || results.categories.length > 0) && (
              <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-vedicana-green font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:text-vedicana-dark-green transition-colors"
                >
                  View all results <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
