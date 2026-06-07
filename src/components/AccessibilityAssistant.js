'use client';
import React, { useState, useEffect } from 'react';
import { Accessibility, Volume2, VolumeX, ZoomIn, Contrast, X, Info } from 'lucide-react';

export default function AccessibilityAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);

  // Text-To-Speech helper
  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // cancel any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger voice feedback on toggling voice mode
  const toggleVoiceMode = () => {
    const nextState = !voiceActive;
    setVoiceActive(nextState);
    if (nextState) {
      speakText("Screen reader mode enabled. Hover your mouse over any text or tab with your keyboard to hear description.");
    } else {
      speakText("Screen reader mode disabled.");
    }
  };

  const toggleHighContrast = () => {
    if (typeof document === 'undefined') return;
    const active = document.body.classList.toggle('theme-high-contrast');
    setIsHighContrast(active);
    speakText(active ? "High contrast mode active. Yellow text on black background." : "Normal contrast restored.");
  };

  const toggleLargeText = () => {
    if (typeof document === 'undefined') return;
    const active = document.body.classList.toggle('theme-large-text');
    setIsLargeText(active);
    speakText(active ? "Text dimensions enlarged by twenty five percent." : "Standard text size restored.");
  };

  // 1. Global Mouseover / Focusin Speech Synthesis listeners
  useEffect(() => {
    if (!voiceActive) return;

    const handleMouseOver = (e) => {
      const el = e.target;
      const tagName = el.tagName.toLowerCase();
      
      // Read specific textual elements to prevent structural containers noise
      if (['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'input', 'label', 'li', 'td', 'th'].includes(tagName)) {
        const textToRead = el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || '';
        const cleanText = textToRead.trim();
        if (cleanText && cleanText.length < 350) {
          speakText(cleanText);
        }
      }
    };

    const handleFocus = (e) => {
      const el = e.target;
      const textToRead = el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || '';
      const cleanText = textToRead.trim();
      if (cleanText) {
        speakText(`Focused element: ${cleanText}`);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [voiceActive]);

  // 2. Global Keyboard Shortcuts (Alt + S, Alt + H, Alt + A)
  useEffect(() => {
    const handleShortcuts = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          speakText("VediCana Organics Online Store. Access products, cart, or consultations.");
        } else if (key === 'h') {
          e.preventDefault();
          speakText("Home menu item. Ayurvedic remedies crafted for organic wellness.");
        } else if (key === 'a') {
          e.preventDefault();
          speakText("Ayurvedic Body Quiz page. Find your dominant Vata, Pitta or Kapha bio-elements.");
        }
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  return (
    <div className="fixed bottom-20 right-6 z-[9999] font-sans print:hidden">
      {/* Floating Launcher Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          speakText(isOpen ? "Closing accessibility panel." : "Opening Ayurvedic accessibility panel.");
        }}
        className="w-12 h-12 bg-vedicana-green hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-emerald-600/30"
        title="Accessibility Assistant"
        aria-label="Accessibility Assistant panel"
      >
        <Accessibility size={20} className="animate-pulse" />
      </button>

      {/* Launcher Panel Modal */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-[#1e293b] text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Accessibility Menu</h3>
              <p className="text-[10px] text-slate-400">Assisting Visually Impaired Visitors</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          {/* Controls list */}
          <div className="space-y-3">
            {/* Audio Speech reader */}
            <button
              onClick={toggleVoiceMode}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                voiceActive 
                  ? 'bg-emerald-650/20 border-vedicana-green text-vedicana-green' 
                  : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850'
              }`}
            >
              <span className="flex items-center gap-2">
                {voiceActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
                Text-to-Speech Reader
              </span>
              <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
                {voiceActive ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                isHighContrast 
                  ? 'bg-yellow-500/10 border-yellow-550 text-yellow-450' 
                  : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850'
              }`}
            >
              <span className="flex items-center gap-2">
                <Contrast size={16} />
                High Contrast Colors
              </span>
              <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
                {isHighContrast ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Text Enlarger */}
            <button
              onClick={toggleLargeText}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                isLargeText 
                  ? 'bg-teal-500/10 border-teal-500 text-teal-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850'
              }`}
            >
              <span className="flex items-center gap-2">
                <ZoomIn size={16} />
                Enlarge Site Text
              </span>
              <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-slate-400">
                {isLargeText ? '1.25X' : '1.0X'}
              </span>
            </button>
          </div>

          {/* Guidelines notes */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider">
              <Info size={11} className="text-vedicana-gold" /> Keyboard Shortcuts:
            </span>
            <ul className="text-[9px] text-slate-400 list-disc pl-4 space-y-1 leading-normal">
              <li>Press <strong className="text-white font-semibold">Tab</strong> key on load to jump directly to page content.</li>
              <li>Press <strong className="text-white font-semibold">Alt + S</strong> to hear Store Status.</li>
              <li>Press <strong className="text-white font-semibold">Alt + H</strong> to read Homepage summary info.</li>
              <li>Press <strong className="text-white font-semibold">Alt + A</strong> to hear Ayurvedic Prakriti Quiz details.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
