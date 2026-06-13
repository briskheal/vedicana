"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundAudio({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try to autoplay
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          // If it plays successfully, show controls softly
          setShowControls(true);
        })
        .catch(error => {
          console.log("Autoplay prevented. Showing play button.", error);
          setShowControls(true);
        });
    }

    // Cleanup: pause audio when navigating away
    return () => {
      audio.pause();
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      
      {showControls && (
        <button
          onClick={togglePlay}
          className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-vedicana-gold/30 text-vedicana-dark-green hover:scale-110 hover:bg-white transition-all duration-300"
          title={isPlaying ? "Mute Background Mantra" : "Play Background Mantra"}
        >
          {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      )}
    </>
  );
}
