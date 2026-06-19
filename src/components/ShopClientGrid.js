'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';

export default function ShopClientGrid({ allProducts, categories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const pageParam = searchParams.get('page') || '1';

  const isAllActive = !categorySlug;

  // Pagination & limit setups
  let limit = 12;
  if (limitParam === 'all') {
    limit = null;
  } else if (limitParam) {
    limit = parseInt(limitParam, 10) || 12;
  }
  const page = parseInt(pageParam, 10) || 1;

  // Filter products on the client
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    
    if (categorySlug) {
      filtered = filtered.filter(p => p.Category && p.Category.slug === categorySlug);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [allProducts, categorySlug, searchQuery]);

  const count = filteredProducts.length;
  const totalPages = limit ? Math.ceil(count / limit) : 1;
  const offset = limit ? (page - 1) * limit : 0;
  
  const currentProducts = limit ? filteredProducts.slice(offset, offset + limit) : filteredProducts;

  // Local state for search form
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localSearchQuery) {
      params.set('q', localSearchQuery);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1'); // reset page when filters change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar / Filters */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
          <h3 className="text-[13px] font-sans font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3">
            <Filter size={14} className="text-vedicana-green" /> Categories
          </h3>
          <ul className="space-y-2.5">
            <li>
              <button 
                onClick={() => updateParam('category', null)}
                className={`flex w-full items-center gap-2 font-sans text-[13px] tracking-wider transition-all duration-300 ${
                  isAllActive 
                    ? 'text-vedicana-green pl-1 font-bold' 
                    : 'text-gray-850 font-medium hover:text-vedicana-green hover:pl-1'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isAllActive ? 'bg-vedicana-gold scale-100' : 'bg-transparent scale-0 w-0'}`}></span>
                All Products <span className="text-gray-550 font-medium ml-auto">({allProducts.length})</span>
              </button>
            </li>
            {categories.map(cat => {
              const isActive = categorySlug === cat.slug;
              return (
                <li key={cat.id} className="border-t border-gray-100/50 pt-2.5">
                  <button 
                    onClick={() => updateParam('category', cat.slug)}
                    className={`flex w-full text-left items-center gap-2 font-sans text-[13px] tracking-wider transition-all duration-300 ${
                      isActive 
                        ? 'text-vedicana-green pl-1 font-bold' 
                        : 'text-gray-850 font-medium hover:text-vedicana-green hover:pl-1'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-vedicana-gold scale-100' : 'bg-transparent scale-0 w-0'}`}></span>
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        {/* Shop Control Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full sm:w-auto relative max-w-xs">
            <input 
              type="text" 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full bg-gray-55/50 border border-gray-200 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-vedicana-green font-medium text-gray-800"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vedicana-green cursor-pointer">
              <Search size={14} />
            </button>
          </form>

          {/* Results count display */}
          <span className="text-xs text-gray-500 font-medium">
            Showing {currentProducts.length} of {count} products
          </span>

          {/* Sizing options: 12, 24, 36, All */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Show:</span>
            <div className="flex rounded-lg border border-gray-150 p-0.5 bg-gray-50/50">
              {[12, 24, 36, 'all'].map((lim) => {
                const label = lim === 'all' ? 'All' : lim;
                const isCurrent = lim === 'all' ? limit === null : limit === lim;
                return (
                  <button
                    key={lim}
                    onClick={() => updateParam('limit', lim)}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                      isCurrent 
                        ? 'bg-vedicana-green text-white shadow-sm' 
                        : 'text-gray-650 hover:text-vedicana-green'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <div className="relative h-72 overflow-hidden bg-gray-100 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:opacity-0 transition-opacity pointer-events-none"></div>
                <Link href={`/shop/${product.slug}`} className="w-full h-full bg-vedicana-bg flex items-center justify-center relative">
                  <Image 
                    src={product.image || 'https://via.placeholder.com/800x800?text=No+Image'} 
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {product.sale_price && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Sale
                    </span>
                  </div>
                )}
                {product.Category && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur text-vedicana-dark-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                      {product.Category.name}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/shop/${product.slug}`} className="block">
                  <h3 className="text-xl font-serif mb-3 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-1">{product.title}</h3>
                </Link>
                <div 
                  className="text-sm text-gray-550 mb-6 line-clamp-2" 
                  dangerouslySetInnerHTML={{ 
                    __html: (product.short_description && product.short_description.replace(/<[^>]*>/g, '').trim().length > 0)
                      ? product.short_description 
                      : product.description 
                  }} 
                />
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-vedicana-green">₹{product.sale_price || product.price}</span>
                    {product.sale_price && (
                      <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    )}
                  </div>
                  <AddToCartButton product={product} variant="small" />
                </div>
              </div>
            </div>
          ))}
          
          {currentProducts.length === 0 && (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 border-t border-gray-100 pt-8">
            <button 
              onClick={() => updateParam('page', page - 1)}
              disabled={page <= 1}
              className={`p-2 rounded-full border flex items-center justify-center transition-all ${
                page > 1 
                  ? 'border-gray-200 hover:border-vedicana-green text-gray-700 bg-white hover:shadow-sm cursor-pointer' 
                  : 'border-gray-150 text-gray-300 pointer-events-none bg-gray-50/20'
              }`}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button 
                key={p} 
                onClick={() => updateParam('page', p)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  p === page 
                    ? 'bg-vedicana-green border-vedicana-green text-white shadow-sm' 
                    : 'border-gray-200 bg-white text-gray-750 hover:border-vedicana-green cursor-pointer'
                }`}
              >
                {p}
              </button>
            ))}

            <button 
              onClick={() => updateParam('page', page + 1)}
              disabled={page >= totalPages}
              className={`p-2 rounded-full border flex items-center justify-center transition-all ${
                page < totalPages 
                  ? 'border-gray-200 hover:border-vedicana-green text-gray-700 bg-white hover:shadow-sm cursor-pointer' 
                  : 'border-gray-150 text-gray-300 pointer-events-none bg-gray-50/20'
              }`}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
