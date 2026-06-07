"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const defaultSlides = [
  {
    id: 'default-1',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-1.png',
    link: '/shop'
  },
  {
    id: 'default-2',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-2.png',
    link: '/shop'
  },
  {
    id: 'default-3',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-4.png',
    link: '/shop'
  },
  {
    id: 'default-4',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-3.png',
    link: '/shop'
  }
];

export default function HeroSlider({ slides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Fallback if prop slides list is empty
  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  // Auto-slide logic
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handleNext = () => {
    if (animating || activeSlides.length <= 1) return;
    setAnimating(true);
    setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setAnimating(false), 800);
  };

  const handlePrev = () => {
    if (animating || activeSlides.length <= 1) return;
    setAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
    setTimeout(() => setAnimating(false), 800);
  };

  const handleDotClick = (index) => {
    if (animating || index === currentSlide || activeSlides.length <= 1) return;
    setAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <section className="relative overflow-hidden w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1] bg-gray-950">
      
      {/* Slides */}
      {activeSlides.map((slide, index) => {
        const isActive = index === currentSlide;
        const hasOverlayText = Boolean(slide.title || slide.subtitle || slide.badge || slide.link);

        return (
          <div 
            key={slide.id || index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Link href={slide.link || '/shop'} className="block w-full h-full">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title || "VediCana Hero Banner"} 
                  className={`w-full h-full object-cover object-right transform transition-transform duration-[9000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gradient-to-br', 'from-[#0f172a]', 'to-[#020617]');
                  }}
                />
              </Link>

              {/* Text overlays with soft gradient behind (only if title/subtitle/badge exists) */}
              {isActive && hasOverlayText && (
                <>
                  {/* Subtle left-side dark gradient to ensure text readability (only if overlay text is configured) */}
                  {Boolean(slide.badge || slide.title || slide.subtitle) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10 pointer-events-none" />
                  )}
                  
                  {/* Content Panel */}
                  <div className="absolute inset-y-0 left-0 flex items-center z-20 px-8 md:px-16 lg:px-24 max-w-xl pointer-events-none">
                    <div className="space-y-2 md:space-y-4 text-left pointer-events-auto">
                      {slide.badge && (
                        <span className="inline-block bg-vedicana-gold text-slate-900 text-[9px] md:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md border border-vedicana-gold/30">
                          {slide.badge}
                        </span>
                      )}
                      {slide.title && (
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow">
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p className="text-xs md:text-sm lg:text-base text-slate-350 font-medium leading-relaxed drop-shadow">
                          {slide.subtitle}
                        </p>
                      )}
                      <Link 
                        href={slide.link || '/shop'}
                        className="inline-flex items-center justify-center bg-vedicana-green hover:bg-emerald-700 text-white font-bold text-[10px] md:text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg transition-transform hover:-translate-y-0.5 mt-1"
                      >
                        Explore Now
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows (Only show if > 1 slide) */}
      {activeSlides.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-30 pointer-events-none">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/40 backdrop-blur-md hover:bg-vedicana-gold text-white flex items-center justify-center transition-all pointer-events-auto border border-white/10 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/40 backdrop-blur-md hover:bg-vedicana-gold text-white flex items-center justify-center transition-all pointer-events-auto border border-white/10 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      )}

      {/* Dots Navigator (Only show if > 1 slide) */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-3.5 z-30">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                index === currentSlide ? 'bg-vedicana-gold w-8 shadow-[0_0_8px_rgba(255,174,0,0.5)]' : 'bg-white/30 hover:bg-white/70 w-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
