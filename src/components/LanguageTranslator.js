'use client';
import React, { useState, useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },      // Swedish
  { code: 'ro', name: 'Română' },       // Romanian
  { code: 'ru', name: 'Русский' },      // Russian
  { code: 'es', name: 'Español' },      // Spanish
  { code: 'hi', name: 'हिन्दी' },         // Hindi
  { code: 'te', name: 'తెలుగు' },        // Telugu
  { code: 'ta', name: 'தமிழ்' },         // Tamil
  { code: 'kn', name: 'ಕನ್ನಡ' },        // Kannada
  { code: 'or', name: 'ଓଡ଼ିଆ' },         // Odia
  { code: 'bn', name: 'বাংলা' },         // Bengali
  { code: 'gu', name: 'ગુજરાતી' }       // Gujarati
];

export default function LanguageTranslator() {
  const [selectedLang, setSelectedLang] = useState('en');

  // Read the active translation language from cookies
  const getActiveLanguage = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match('(^|;) ?googtrans=([^;]*)(;|$)');
      if (match) {
        const parts = match[2].split('/');
        return parts[2] || 'en';
      }
    }
    return 'en';
  };

  useEffect(() => {
    setSelectedLang(getActiveLanguage());

    // 1. Define callback globally
    window.GoogleLanguageTranslatorInit = function() {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          autoDisplay: false
        }, 'google_language_translator');
      }
    };

    // 2. Append the loader script if not present
    const scriptId = 'google-translate-loader';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=GoogleLanguageTranslatorInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Periodically check and re-initialize Google Translate if container is recreated empty on route transitions
    const interval = setInterval(() => {
      const gltContainer = document.getElementById('google_language_translator');
      if (gltContainer && gltContainer.innerHTML.length === 0) {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          try {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: false
            }, 'google_language_translator');
            console.log("Re-initialized Google Translate Element successfully.");
          } catch (err) {
            console.error("Error re-initializing google translate:", err);
          }
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (langCode) => {
    const teCombo = document.querySelector('select.goog-te-combo');
    if (teCombo) {
      teCombo.value = langCode;
      
      const fireEvent = (element, eventName) => {
        if (document.createEvent) {
          const event = document.createEvent("HTMLEvents");
          event.initEvent(eventName, true, true);
          element.dispatchEvent(event);
        } else {
          const event = document.createEventObject();
          element.fireEvent('on' + eventName, event);
        }
      };
      fireEvent(teCombo, 'change');
      fireEvent(teCombo, 'change');
    } else {
      // If combo box is not ready yet, wait and try again
      setTimeout(() => handleLanguageChange(langCode), 200);
    }
  };

  const onChange = (e) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    handleLanguageChange(lang);
  };

  return (
    <div className="flex items-center">
      {/* Our Custom Premium styled Dropdown Selector */}
      <select 
        value={selectedLang} 
        onChange={onChange}
        className="premium-lang-selector"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      {/* Hidden Container for Google Translate Combobox */}
      <div id="google_language_translator" style={{ display: 'none', visibility: 'hidden' }} />
      
      {/* Styling */}
      <style jsx global>{`
        .premium-lang-selector {
          background-color: #ffffff !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 9999px !important;
          padding: 6px 14px !important;
          font-family: inherit !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: #334155 !important;
          cursor: pointer !important;
          transition: all 0.2s ease-in-out !important;
          outline: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 12px center !important;
          background-size: 10px !important;
          padding-right: 28px !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }

        .premium-lang-selector:hover {
          border-color: #006d39 !important;
          color: #006d39 !important;
          background-color: #f0fdf4 !important;
          box-shadow: 0 2px 8px rgba(0, 109, 57, 0.08) !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23006d39' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
        }

        /* Suppress leftover Google Translate style artifacts */
        #google_language_translator,
        .skiptranslate,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          pointer-events: none !important;
        }

        body {
          top: 0px !important;
          position: relative !important;
        }
      `}</style>
    </div>
  );
}
