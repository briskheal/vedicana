"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Info, HelpCircle } from 'lucide-react';

const CHAKRAS_DATA = [
  {
    id: 'sahasrara',
    name: 'Sahasrara',
    english: 'The Crown Chakra',
    mantra: 'AUM',
    location: 'Top of the Head (Cranium)',
    color: '#8b5cf6', // Violet
    glowColor: 'rgba(139, 92, 246, 0.4)',
    borderColor: 'border-violet-200 bg-violet-50/20 text-violet-700',
    faculty: 'Pure awareness, cosmic space, and spiritual union.',
    description: 'The crown chakra represents the highest state of consciousness and the "door of God." When awakened, it dissolves the individual ego into pure space, light, and infinite consciousness, culminating in nirvikalpa samadhi.'
  },
  {
    id: 'ajna',
    name: 'Ajna',
    english: 'The Third Eye Chakra',
    mantra: 'OM',
    location: 'Between the Eyebrows',
    color: '#4f46e5', // Indigo
    glowColor: 'rgba(79, 70, 229, 0.4)',
    borderColor: 'border-indigo-200 bg-indigo-50/20 text-indigo-700',
    faculty: 'Divine sight, direct cognition, and intuitive vision.',
    description: 'Governing the two channels of inner sight—the ability to look into lower and higher spiritual worlds—the Ajna chakra provides a unified spiritual vision, letting the awakened soul perceive absolute truth directly.'
  },
  {
    id: 'vishuddha',
    name: 'Vishuddha',
    english: 'The Throat Chakra',
    mantra: 'HAM',
    location: 'Throat and Thyroid Plexus',
    color: '#0ea5e9', // Sky Blue
    glowColor: 'rgba(14, 165, 233, 0.4)',
    borderColor: 'border-sky-200 bg-sky-50/20 text-sky-755',
    faculty: 'Universal divine love, harmony, and celestial flow.',
    description: 'When awareness vibrates in the Vishuddha, one experiences inexpressible love and kinship for all creation. Ego-mind recedes, leaving a state of pure radiant energy and unity with the spiritual current.'
  },
  {
    id: 'anahata',
    name: 'Anahata',
    english: 'The Heart Chakra',
    mantra: 'YAM',
    location: 'Center of the Chest (Cardiac Plexus)',
    color: '#10b981', // Emerald Green
    glowColor: 'rgba(16, 185, 129, 0.4)',
    borderColor: 'border-emerald-200 bg-emerald-50/20 text-emerald-700',
    faculty: 'Direct perception, insight, and emotional balance.',
    description: 'The "lotus of the heart" is the seat of empathy and balance. Abiding here brings a deep understanding of human nature, effortless tolerance, and the innate power to resolve conflict and establish harmony.'
  },
  {
    id: 'manipura',
    name: 'Manipura',
    english: 'The Solar Plexus Chakra',
    mantra: 'RAM',
    location: 'Solar Plexus (Gastric Brain)',
    color: '#eab308', // Yellow
    glowColor: 'rgba(234, 179, 8, 0.4)',
    borderColor: 'border-yellow-250 bg-yellow-50/20 text-yellow-700',
    faculty: 'Willpower, individuality, and metabolic energy.',
    description: 'As the junction point of worldly and spiritual drives, the Manipura chakra channels willpower. Inwardly directed, it fuels spiritual consciousness; outwardly directed, it intensifies ego and instinct.'
  },
  {
    id: 'svadishthana',
    name: 'Svadishthana',
    english: 'The Sacral Chakra',
    mantra: 'VAM',
    location: 'Lower Spine (Abdominal Plexus)',
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.4)',
    borderColor: 'border-orange-200 bg-orange-50/20 text-orange-700',
    faculty: 'Reason, intellect, and exploratory enquiry.',
    description: 'The center of analytical manipulation of information and reason. It drives our intellectual wondering, seeking logical structures and exploring the "why" of creation and physical phenomena.'
  },
  {
    id: 'muladhara',
    name: 'Muladhara',
    english: 'The Root Chakra',
    mantra: 'LAM',
    location: 'Base of the Spine (Coccygeal Plexus)',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    borderColor: 'border-red-200 bg-red-50/20 text-red-700',
    faculty: 'Memory, physical stability, and time consciousness.',
    description: 'The foundational base located at the spine\'s root. Muladhara governs memory patterns, language acquisition, survival instincts, and physically anchors our current incarnation and past-life records.'
  }
];

export default function ChakraWheel() {
  const [activeChakra, setActiveChakra] = useState(CHAKRAS_DATA[0]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const target = document.getElementById('chakra-wheel-placeholder');
    if (target) {
      setPortalTarget(target);
      return;
    }

    const intervalId = setInterval(() => {
      const el = document.getElementById('chakra-wheel-placeholder');
      if (el) {
        setPortalTarget(el);
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [mounted]);

  // Slow rotation animation
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.15) % 360);
    }, 16); // ~60fps smooth rotation
    return () => clearInterval(interval);
  }, [isRotating]);

  // Generate SVG Segment Paths dynamically
  const R = 130; // Outer Radius
  const r = 50;  // Inner Radius (to create a ring)
  const cx = 150;
  const cy = 150;

  const getSegmentPath = (idx) => {
    const theta1 = (idx * 360 / 7) - 90; // offset by -90 to start at top
    const theta2 = ((idx + 1) * 360 / 7) - 90;
    
    const rad1 = theta1 * Math.PI / 180;
    const rad2 = theta2 * Math.PI / 180;
    
    // Outer points
    const x1_out = cx + R * Math.cos(rad1);
    const y1_out = cy + R * Math.sin(rad1);
    const x2_out = cx + R * Math.cos(rad2);
    const y2_out = cy + R * Math.sin(rad2);
    
    // Inner points
    const x1_in = cx + r * Math.cos(rad1);
    const y1_in = cy + r * Math.sin(rad1);
    const x2_in = cx + r * Math.cos(rad2);
    const y2_in = cy + r * Math.sin(rad2);
    
    return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${R} ${R} 0 0 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${r} ${r} 0 0 0 ${x1_in} ${y1_in} Z`;
  };

  const wheelContent = (
    <div className="my-12 font-sans select-none border border-[#e6c280]/20 bg-gradient-to-br from-[#fcfbf7] to-white p-6 md:p-8 rounded-3xl shadow-md">
      
      {/* Introduction Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-vedicana-green/10 text-vedicana-green text-[10px] md:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm border border-vedicana-green/20">
          <Sparkles size={13} className="text-vedicana-gold animate-pulse" />
          Interactive Vedic Console
        </span>
      </div>

      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-xl md:text-2xl font-serif text-vedicana-dark-green font-bold mb-2">
          The Seven Chakras of Higher Consciousness
        </h3>
        <p className="text-xs md:text-sm text-gray-500 font-light">
          Experience the spinning vortices of vital energy (prana). Click any colored segment on the sacred wheel to awaken and explore its spiritual attributes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        
        {/* Left Side: Dynamic Spinning Wheel */}
        <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex-shrink-0 flex items-center justify-center">
          
          {/* Orbital rings shadow effects */}
          <div className="absolute inset-0 rounded-full border border-gray-150/40 scale-105 pointer-events-none" />
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#e6c280]/20 scale-95 pointer-events-none animate-spin" style={{ animationDuration: '60s' }} />

          {/* Dynamic SVG Wheel */}
          <svg 
            viewBox="0 0 300 300"
            className="w-full h-full drop-shadow-xl cursor-pointer"
            onMouseEnter={() => setIsRotating(false)}
            onMouseLeave={() => setIsRotating(true)}
            style={{ 
              transform: `rotate(${rotationAngle}deg)`,
              transition: isRotating ? 'none' : 'transform 0.4s ease-out' 
            }}
          >
            <g>
              {CHAKRAS_DATA.map((chakra, idx) => {
                const isActive = activeChakra.id === chakra.id;
                
                // Calculate segment midpoint angle and center placement coordinates
                const R_text = 90; // Midpoint radius between inner (50) and outer (130) boundaries
                const theta_mid = (idx * 360 / 7) - 90 + (360 / 14); // exact segment midpoint angle
                const rad_mid = theta_mid * Math.PI / 180;
                
                const x_text = cx + R_text * Math.cos(rad_mid);
                const y_text = cy + R_text * Math.sin(rad_mid);
                
                // Align text rotation radially outwards
                let textRotation = theta_mid;
                
                // Keep text right-side up by flipping it 180 degrees on the left side of the wheel
                let normAngle = theta_mid % 360;
                if (normAngle < 0) normAngle += 360;
                
                if (normAngle > 90 && normAngle < 270) {
                  textRotation += 180;
                }

                return (
                  <g key={chakra.id} className="group">
                    <path 
                      d={getSegmentPath(idx)}
                      fill={chakra.color}
                      opacity={isActive ? 0.95 : 0.72}
                      className="transition-all duration-300 hover:opacity-100 hover:scale-102"
                      stroke="#ffffff"
                      strokeWidth={isActive ? 2.5 : 1}
                      onClick={() => setActiveChakra(chakra)}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 8px ${chakra.color})` : 'none'
                      }}
                    />
                    <text
                      x={x_text}
                      y={y_text}
                      fill="#ffffff"
                      fontSize="6.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${textRotation}, ${x_text}, ${y_text})`}
                      className="pointer-events-none tracking-wider uppercase font-sans select-none"
                      style={{ 
                        textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {chakra.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Inner Core Cover */}
            <circle 
              cx="150" 
              cy="150" 
              r="49" 
              fill="#ffffff" 
              stroke="#e6c280" 
              strokeWidth="2.5"
              className="drop-shadow-md"
            />
          </svg>

          {/* Central Non-Rotating Hub (keeps symbol/text upright) */}
          <div 
            className="absolute w-20 h-20 rounded-full bg-[#fdfaf5] border border-[#e6c280]/40 flex flex-col items-center justify-center text-center shadow-inner pointer-events-none"
            style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
          >
            <span className="text-[10px] font-bold text-[#e6c280] tracking-widest uppercase mb-0.5">MANTRA</span>
            <span 
              className="text-lg font-serif font-bold transition-all duration-300 animate-pulse"
              style={{ color: activeChakra.color }}
            >
              {activeChakra.mantra}
            </span>
          </div>

        </div>

        {/* Right Side: Glassmorphic Details Box */}
        <div className="flex-1 w-full max-w-md">
          <div 
            className="min-h-[260px] p-6 bg-white/95 rounded-2xl border border-gray-150 shadow-sm transition-all duration-500 relative overflow-hidden"
            style={{
              borderLeftWidth: '6px',
              borderLeftColor: activeChakra.color,
              boxShadow: `0 10px 30px -15px ${activeChakra.glowColor}`
            }}
          >
            {/* Ambient Background Glow */}
            <div 
              className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full blur-3xl opacity-10 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: activeChakra.color }}
            />

            {/* Active Header */}
            <div className="flex items-start justify-between gap-4 mb-4 border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                  {activeChakra.name}
                </h4>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  {activeChakra.english}
                </p>
              </div>
              <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${activeChakra.borderColor}`}>
                Mantra: {activeChakra.mantra}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs md:text-sm">
                <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 font-semibold block uppercase tracking-wider text-[10px] text-gray-400">Location in Body</strong>
                  <span className="text-gray-700 font-medium">{activeChakra.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs md:text-sm">
                <HelpCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900 font-semibold block uppercase tracking-wider text-[10px] text-gray-400">Core Mental Faculty</strong>
                  <span className="text-gray-700 font-medium">{activeChakra.faculty}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs md:text-[13px] text-gray-600 leading-relaxed font-light text-justify italic">
                  {activeChakra.description}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Visual interactive indicator */}
      <p className="text-center text-[10px] text-gray-400 tracking-wider uppercase mt-6 animate-pulse hidden md:block">
        ← Move cursor over the wheel to pause rotation and explore details →
      </p>

    </div>
  );

  if (!mounted) {
    return null;
  }

  if (portalTarget) {
    return createPortal(wheelContent, portalTarget);
  }

  return wheelContent;
}
