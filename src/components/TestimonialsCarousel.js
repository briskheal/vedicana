"use client";
import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function TestimonialsCarousel({ testimonials = [] }) {
  const scrollRef = useRef(null);

  // Dynamic scroll logic (Card size + Gap offset)
  const scroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      
      const card = container.querySelector('.snap-start');
      let scrollStep = 380 + 24; // default fallback

      if (card) {
        const cardWidth = card.offsetWidth;
        const containerStyle = window.getComputedStyle(container);
        const gap = parseInt(containerStyle.gap) || 24;
        scrollStep = cardWidth + gap;
      } else {
        const width = window.innerWidth;
        if (width < 640) {
          scrollStep = 290 + 24;
        } else if (width < 768) {
          scrollStep = 350 + 24;
        } else {
          scrollStep = 380 + 24;
        }
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

  // Auto-scrolling logic (Slow, pleasant 9-second reading pace)
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const autoScrollTimer = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const { scrollLeft, clientWidth, scrollWidth } = container;

        // Check if we are near the end of the scroll track (within 20px threshold)
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          // Wrap around seamlessly to the beginning
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Advance to the next testimonial card
          scroll('right');
        }
      }
    }, 9000); // 9 seconds interval for comfortable legibility

    return () => clearInterval(autoScrollTimer);
  }, [testimonials.length]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Left Navigation Button */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 lg:-ml-6 z-20 w-12 h-12 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-gray-700 hover:text-vedicana-green hover:border-vedicana-green hover:scale-105 active:scale-95 transition-all cursor-pointer hidden md:flex opacity-90 hover:opacity-100 hover:shadow-lg"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={24} />
      </button>
      
      {/* Right Navigation Button */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 lg:-mr-6 z-20 w-12 h-12 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-gray-700 hover:text-vedicana-green hover:border-vedicana-green hover:scale-105 active:scale-95 transition-all cursor-pointer hidden md:flex opacity-90 hover:opacity-100 hover:shadow-lg"
        aria-label="Scroll Right"
      >
        <ChevronRight size={24} />
      </button>

      {/* Horizontal scroll track container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
      >
        {testimonials.map((t, idx) => (
          <div 
            key={idx} 
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between flex-shrink-0 w-[290px] sm:w-[350px] md:w-[380px] snap-start"
          >
            <div className="space-y-4">
              {/* Rating Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-vedicana-gold text-vedicana-gold" />
                ))}
              </div>
              {/* Message */}
              <p className="text-gray-650 text-sm leading-relaxed italic font-light">
                "{t.message}"
              </p>
            </div>
            {/* Author Info */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-50">
              <div className="w-10 h-10 rounded-full bg-vedicana-green/10 text-vedicana-green flex items-center justify-center font-bold text-sm">
                {t.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t.name}</h4>
                <span className="text-[11px] text-gray-400 font-light">{t.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile Indicator Swipe Hint */}
      <div className="text-center mt-2 text-[10px] text-gray-400 font-light tracking-wide md:hidden">
        ← Swipe horizontally to explore testimonies →
      </div>
    </div>
  );
}
