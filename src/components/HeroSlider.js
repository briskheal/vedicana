"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const defaultSlides = [
  {
    id: 'default-1',
    image: '/images/products/vedicana-mustard-honey.webp',
    link: '/shop'
  },
  {
    id: 'default-2',
    image: '/images/products/vedicana-jamun-honey.webp',
    link: '/shop'
  },
  {
    id: 'default-3',
    image: '/images/products/vedicana-sudh-desi-ghee.webp',
    link: '/shop'
  },
  {
    id: 'default-4',
    image: '/images/products/vedicana-chyawanprash.webp',
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
              <Link href={slide.link || '/shop'} className="block relative w-full h-full">
                {/* Background Image */}
                <Image 
                  src={slide.image || '/images/banners/slide-13.webp'} 
                  alt={slide.title || "VediCana Hero Banner"} 
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`object-cover object-right transform transition-transform duration-[9000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
              </Link>

              {/* Text overlays with soft gradient behind (only if title/subtitle/badge exists) */}
              {isActive && (
                <>
                  {/* Button at the bottom center */}
                  <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                      <Link 
                        href={slide.link || '/shop'}
                        className="inline-flex items-center justify-center bg-vedicana-green/90 hover:bg-emerald-700 backdrop-blur-sm text-white font-bold text-[10px] md:text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
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
