"use client";
import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';

export default function RelatedProductsCarousel({ products = [] }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.querySelector('.snap-start');
      let scrollStep = 300 + 32; // Default fallback (card width + gap)

      if (card) {
        const cardWidth = card.offsetWidth;
        const containerStyle = window.getComputedStyle(container);
        const gap = parseInt(containerStyle.gap) || 32;
        scrollStep = cardWidth + gap;
      }

      const { scrollLeft } = container;
      const scrollToValue = direction === 'left' 
        ? scrollLeft - scrollStep 
        : scrollLeft + scrollStep;
      
      container.scrollTo({
        left: scrollToValue,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scrolling logic (Slow, pleasant 8-second transition)
  useEffect(() => {
    if (products.length <= 4) return;

    const autoScrollTimer = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const { scrollLeft, clientWidth, scrollWidth } = container;

        // Check if we are near the end of the scroll track (within 20px threshold)
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          scroll('right');
        }
      }
    }, 8000); // 8 seconds interval

    return () => clearInterval(autoScrollTimer);
  }, [products.length]);

  if (products.length === 0) return null;

  const isCarousel = products.length > 4;

  return (
    <div className="relative w-full">
      {/* Left Navigation Button */}
      {isCarousel && (
        <button 
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 lg:-ml-6 z-20 w-11 h-11 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-gray-700 hover:text-vedicana-green hover:border-vedicana-green hover:scale-105 active:scale-95 transition-all cursor-pointer hidden md:flex opacity-90 hover:opacity-100 hover:shadow-lg"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      
      {/* Right Navigation Button */}
      {isCarousel && (
        <button 
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 lg:-mr-6 z-20 w-11 h-11 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-gray-700 hover:text-vedicana-green hover:border-vedicana-green hover:scale-105 active:scale-95 transition-all cursor-pointer hidden md:flex opacity-90 hover:opacity-100 hover:shadow-lg"
          aria-label="Scroll Right"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Related remedies view track */}
      {isCarousel ? (
        <div className="w-full">
          {/* Mobile Indicator Swipe Hint */}
          <div className="text-center text-[10px] text-gray-400 font-light tracking-wide md:hidden mb-4 animate-pulse">
            ← Swipe horizontally to explore related remedies →
          </div>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
          >
            {products.map((relProduct) => (
              <div 
                key={relProduct.id} 
                className="w-[280px] sm:w-[300px] md:w-[310px] flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-gray-150/60 group flex flex-col snap-start"
              >
                <div className="relative h-60 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                  <Link href={`/shop/${relProduct.slug}`} className="w-full h-full">
                    <Image 
                      src={relProduct.image || 'https://via.placeholder.com/800x800?text=No+Image'} 
                      alt={relProduct.title}
                      fill
                      sizes="(max-width: 640px) 280px, 310px"
                      className="object-cover transform group-hover:scale-103 transition-transform duration-500"
                    />
                  </Link>
                  {relProduct.sale_price && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Sale
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <Link href={`/shop/${relProduct.slug}`} className="block">
                    <h3 className="font-serif text-[15px] text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-1 mb-2 font-bold leading-tight">{relProduct.title}</h3>
                  </Link>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-extrabold text-vedicana-green">₹{relProduct.sale_price || relProduct.price}</span>
                      {relProduct.sale_price && (
                        <span className="text-[11px] text-gray-400 line-through font-medium">₹{relProduct.price}</span>
                      )}
                    </div>
                    <AddToCartButton product={relProduct} variant="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Responsive Grid Layout for <= 4 items */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((relProduct) => (
            <div key={relProduct.id} className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-gray-150/60 group flex flex-col">
              <div className="relative h-60 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 relative">
                <Link href={`/shop/${relProduct.slug}`} className="w-full h-full">
                  <Image 
                    src={relProduct.image || 'https://via.placeholder.com/800x800?text=No+Image'} 
                    alt={relProduct.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    className="object-cover transform group-hover:scale-103 transition-transform duration-500"
                  />
                </Link>
                {relProduct.sale_price && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Sale
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <Link href={`/shop/${relProduct.slug}`} className="block">
                  <h3 className="font-serif text-[15px] text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-1 mb-2 font-bold leading-tight">{relProduct.title}</h3>
                </Link>
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-extrabold text-vedicana-green">₹{relProduct.sale_price || relProduct.price}</span>
                    {relProduct.sale_price && (
                      <span className="text-[11px] text-gray-400 line-through font-medium">₹{relProduct.price}</span>
                    )}
                  </div>
                  <AddToCartButton product={relProduct} variant="small" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
