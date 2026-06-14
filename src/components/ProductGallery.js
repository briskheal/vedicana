"use client";
import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function ProductGallery({ title, primaryImage, gallery = [] }) {
  // Combine primary image and gallery images, filtering out any empty strings
  const rawImages = [primaryImage, ...(gallery || [])].filter(Boolean);
  
  // De-duplicate images to ensure active state mappings are clean
  const uniqueImages = [...new Set(rawImages)];
  
  // Use images if available, fallback to a placeholder array
  const images = uniqueImages.length > 0 ? uniqueImages : [primaryImage];
  const [activeImage, setActiveImage] = useState(images[0] || primaryImage);
  const [isFading, setIsFading] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [isZoomed, setIsZoomed] = useState(false);

  // Guarantee exactly 4 photograph holders
  const slots = Array.from({ length: 4 }).map((_, idx) => images[idx] || null);

  const handleImageChange = (img) => {
    if (!img || img === activeImage) return;
    setIsFading(true);
    setTimeout(() => {
      setActiveImage(img);
      setIsFading(false);
    }, 200);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  return (
    <div className="w-full space-y-5">
      {/* Main Image Viewport */}
      <div 
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false);
          setZoomStyle({ transformOrigin: 'center center' });
        }}
        onMouseMove={handleMouseMove}
        className="bg-[#fcfcfa] rounded-2xl overflow-hidden border border-gray-100/90 aspect-square flex items-center justify-center relative shadow-sm group cursor-zoom-in"
      >
        <Image 
          src={activeImage || 'https://via.placeholder.com/800x800?text=VediCana+Organics'} 
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={isZoomed ? { transform: 'scale(1.8)', transition: 'transform 0.15s ease-out', ...zoomStyle, objectFit: 'contain' } : { transform: 'scale(1)', transition: 'transform 0.15s ease-out', objectFit: 'contain' }}
          className={`p-5 transition-opacity duration-200 ${
            isFading ? 'opacity-30' : 'opacity-100'
          }`}
        />
        
        {/* Subtle premium corner overlays */}
        <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-vedicana-gold/25 rounded-tr pointer-events-none group-hover:border-vedicana-gold transition-colors duration-300"></div>
        <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-vedicana-gold/25 rounded-bl pointer-events-none group-hover:border-vedicana-gold transition-colors duration-300"></div>
      </div>
      
      {/* 4 Photograph Gallery Holders */}
      <div className="grid grid-cols-4 gap-3">
        {slots.map((img, idx) => {
          if (img) {
            const isActive = img === activeImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleImageChange(img)}
                className={`aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 focus:outline-none transition-all duration-300 p-1 flex items-center justify-center hover:scale-105 shadow-sm cursor-pointer relative ${
                  isActive 
                    ? 'border-vedicana-gold shadow-md bg-white scale-102' 
                    : 'border-transparent hover:border-vedicana-green/40 hover:bg-white'
                }`}
                aria-label={`View product image ${idx + 1}`}
              >
                <Image 
                  src={img} 
                  alt={`${title} Thumbnail ${idx + 1}`} 
                  fill
                  sizes="100px"
                  className="object-contain rounded-lg p-1"
                />
              </button>
            );
          } else {
            // Render a premium empty photograph holder card with dotted border
            return (
              <div 
                key={idx}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-gray-300 select-none shadow-sm/30"
                title="Alternative display frame"
              >
                <ImageIcon size={18} className="stroke-[1.5]" />
                <span className="text-[9px] uppercase tracking-wider mt-1.5 font-semibold text-gray-400/80">Slot {idx + 1}</span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
