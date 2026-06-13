"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Music, X, Volume2 } from 'lucide-react';

export default function MantraPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mantras, setMantras] = useState([]);
  const [activeMantra, setActiveMantra] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch public mantras list when modal opens
    if (isOpen && mantras.length === 0) {
      fetch('/api/mantras')
        .then(res => res.json())
        .then(data => setMantras(data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && activeMantra) {
      audio.play().catch(e => {
        console.error("Playback failed:", e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, activeMantra]);

  const togglePlay = (mantra) => {
    if (activeMantra?.id === mantra.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveMantra(mantra);
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Auto-play next if desired, but for now just stop.
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-vedicana-dark-green text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 hover:bg-vedicana-green transition-all duration-300 font-serif font-bold tracking-wide flex items-center gap-2 border-2 border-vedicana-gold/50"
      >
        <Music size={20} className="animate-pulse" />
        Listen Vedic Mantras
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden transform animate-scale-in">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Music size={20} className="text-vedicana-gold" />
                Mantras Library
              </h2>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsPlaying(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Current Player Status */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 flex flex-col items-center border-b border-slate-800">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-700 shadow-[0_0_30px_rgba(212,175,55,0.2)] ${isPlaying ? 'bg-vedicana-dark-green scale-110' : 'bg-slate-800 border border-slate-700'}`}>
                {isPlaying ? (
                  <Volume2 size={40} className="text-vedicana-gold animate-pulse" />
                ) : (
                  <Music size={40} className="text-slate-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white text-center h-7">
                {activeMantra ? activeMantra.title : 'Select a Mantra'}
              </h3>
              <p className="text-sm text-slate-400">
                {isPlaying ? 'Playing...' : activeMantra ? 'Paused' : 'Ready to play'}
              </p>
            </div>

            {/* Audio Element */}
            {activeMantra && (
              <audio 
                ref={audioRef} 
                src={`/api/mantras/audio/${activeMantra.id}`} 
                onEnded={handleEnded} 
                className="hidden"
              />
            )}

            {/* Playlist */}
            <div className="max-h-64 overflow-y-auto bg-slate-900 p-2 custom-scrollbar">
              {mantras.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No mantras available right now.</div>
              ) : (
                <div className="space-y-1">
                  {mantras.map((mantra) => (
                    <button
                      key={mantra.id}
                      onClick={() => togglePlay(mantra)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                        activeMantra?.id === mantra.id 
                          ? 'bg-vedicana-dark-green/30 border border-vedicana-green/50' 
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeMantra?.id === mantra.id ? 'bg-vedicana-green text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {activeMantra?.id === mantra.id && isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-1" />}
                        </div>
                        <span className={`font-semibold ${activeMantra?.id === mantra.id ? 'text-vedicana-gold' : 'text-slate-300'}`}>
                          {mantra.title}
                        </span>
                      </div>
                      
                      {activeMantra?.id === mantra.id && isPlaying && (
                        <div className="flex gap-1">
                          <span className="w-1 h-3 bg-vedicana-gold animate-pulse"></span>
                          <span className="w-1 h-4 bg-vedicana-gold animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-1 h-2 bg-vedicana-gold animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
