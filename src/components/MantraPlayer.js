"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Music, Volume2 } from 'lucide-react';

export default function MantraPlayer() {
  const [mantras, setMantras] = useState([]);
  const [activeMantra, setActiveMantra] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch('/api/mantras')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMantras(data);
        else console.error('Expected array, got:', data);
      })
      .catch(err => console.error(err));
  }, []);

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

  return (
    <div className="bg-slate-900 w-full rounded-2xl shadow-xl border border-slate-700 overflow-hidden mt-12 mb-8">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
          <Music size={20} className="text-vedicana-gold" />
          Vedic Mantras Library
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Current Player Status */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-700 shadow-[0_0_30px_rgba(212,175,55,0.2)] ${isPlaying ? 'bg-vedicana-dark-green scale-110' : 'bg-slate-800 border border-slate-700'}`}>
            {isPlaying ? (
              <Volume2 size={48} className="text-vedicana-gold animate-pulse" />
            ) : (
              <Music size={48} className="text-slate-500" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white text-center h-8">
            {activeMantra ? activeMantra.title : 'Select a Mantra'}
          </h3>
          <p className="text-slate-400 mt-2 mb-6">
            {isPlaying ? 'Playing now...' : activeMantra ? 'Paused' : 'Ready to play'}
          </p>

          {/* Native Audio Element for Volume and Progress Controls */}
          {activeMantra && (
            <div className="w-full mt-auto max-w-[280px]">
              <audio 
                ref={audioRef} 
                src={activeMantra.filename.startsWith('http') ? activeMantra.filename : `/mantras/${activeMantra.filename}`} 
                onEnded={() => setIsPlaying(false)} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
                controlsList="nodownload noplaybackrate"
                className="w-full h-10 rounded-lg outline-none"
              />
            </div>
          )}
        </div>

        {/* Playlist */}
        <div className="h-[400px] overflow-y-auto bg-slate-900 p-4 custom-scrollbar">
          {mantras.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No mantras available right now.</div>
          ) : (
            <div className="space-y-2">
              {mantras.map((mantra) => (
                <button
                  key={mantra.id}
                  onClick={() => togglePlay(mantra)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    activeMantra?.id === mantra.id 
                      ? 'bg-vedicana-dark-green/30 border border-vedicana-green/50' 
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeMantra?.id === mantra.id ? 'bg-vedicana-green text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>
                      {activeMantra?.id === mantra.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-1" />}
                    </div>
                    <span className={`font-semibold text-left ${activeMantra?.id === mantra.id ? 'text-vedicana-gold' : 'text-slate-300'}`}>
                      {mantra.title}
                    </span>
                  </div>
                  
                  {activeMantra?.id === mantra.id && isPlaying && (
                    <div className="flex gap-1.5 mr-2">
                      <span className="w-1.5 h-4 bg-vedicana-gold animate-pulse rounded-full"></span>
                      <span className="w-1.5 h-6 bg-vedicana-gold animate-pulse rounded-full" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-3 bg-vedicana-gold animate-pulse rounded-full" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
