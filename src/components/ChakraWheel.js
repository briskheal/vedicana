"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';

const CHAKRAS = [
  { name: 'Root', color: 'bg-red-500', glow: 'shadow-red-500/80', audio: '/audio/root_lam.mp3', mantra: 'Lam' },
  { name: 'Sacral', color: 'bg-orange-500', glow: 'shadow-orange-500/80', audio: '/audio/sacral_vam.mp3', mantra: 'Vam' },
  { name: 'Solar Plexus', color: 'bg-yellow-400', glow: 'shadow-yellow-400/80', audio: '/audio/solar_ram.mp3', mantra: 'Ram' },
  { name: 'Heart', color: 'bg-green-500', glow: 'shadow-green-500/80', audio: '/audio/heart_yam.mp3', mantra: 'Yam' },
  { name: 'Throat', color: 'bg-blue-400', glow: 'shadow-blue-400/80', audio: '/audio/throat_ham.mp3', mantra: 'Ham' },
  { name: 'Third Eye', color: 'bg-indigo-600', glow: 'shadow-indigo-600/80', audio: '/audio/thirdeye_om.mp3', mantra: 'Om' },
  { name: 'Crown', color: 'bg-purple-600', glow: 'shadow-purple-600/80', audio: '/audio/crown_ah.mp3', mantra: 'Ah' },
];

export default function ChakraWheel() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNext = (index) => {
    if (!isPlayingRef.current) return;

    if (index >= CHAKRAS.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(index);
    setRotation(360 - (index * (360 / 7)));

    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(CHAKRAS[index].audio);
    audioRef.current = audio;
    
    audio.onended = () => {
      setTimeout(() => {
        if (isPlayingRef.current) {
          playNext(index + 1);
        }
      }, 800);
    };

    audio.play().catch(e => {
      console.error("Audio playback failed", e);
      setIsPlaying(false);
      isPlayingRef.current = false;
      setActiveIndex(-1);
    });
  };

  const handleToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setActiveIndex(-1);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playNext(0);
    }
  };

  return (
    <div className="my-16 flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      <div className="absolute w-[500px] h-[500px] bg-slate-800 rounded-full blur-3xl opacity-50"></div>

      <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 z-10 text-center">Interactive Chakra Mantra Wheel</h3>
      <p className="text-slate-400 mb-12 z-10 text-center max-w-md">Experience the spiritual resonance of the 7 bija mantras from Muladhara to Sahasrara.</p>

      <div className="relative w-72 h-72 md:w-96 md:h-96 my-8 z-10">
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button 
            onClick={handleToggle}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] ${isPlaying ? 'bg-slate-800 border-red-500 text-red-500' : 'bg-white border-white text-slate-900 hover:scale-105'}`}
          >
            {isPlaying ? <Square fill="currentColor" size={28} className="mb-1" /> : <Play fill="currentColor" size={32} className="ml-2 mb-1" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isPlaying ? 'Stop' : 'Chant'}</span>
          </button>
        </div>

        <div 
          className="w-full h-full rounded-full border border-slate-700 transition-transform duration-1000 ease-in-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {CHAKRAS.map((chakra, i) => {
            const angle = (i * (360 / 7)) - 90;
            const radius = 50; 
            const x = 50 + radius * Math.cos(angle * (Math.PI / 180));
            const y = 50 + radius * Math.sin(angle * (Math.PI / 180));
            
            const isActive = activeIndex === i;
            
            return (
              <div
                key={chakra.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${-rotation}deg)`
                }}
              >
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${chakra.color} ${isActive ? `scale-125 shadow-[0_0_30px_10px_rgba(0,0,0,0.5)] ${chakra.glow}` : 'opacity-70 scale-90 hover:opacity-100'}`}
                >
                  <span className="text-white font-bold text-lg drop-shadow-md">{chakra.mantra}</span>
                  {isActive && <Volume2 size={12} className="text-white mt-1 animate-pulse" />}
                </div>
                
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="text-xs font-bold text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded-full">{chakra.name} Chakra</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {isPlaying && (
        <div className="flex items-center gap-1 mt-8 h-8 z-10">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-[#d4af37] rounded-full animate-pulse"
              style={{ 
                height: `${Math.random() * 100 + 20}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${Math.random() * 0.5 + 0.5}s`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
