import React from 'react';
import ContactFormSection from './ContactFormSection';
import { MapPin, Phone, Mail, Clock, Sparkles } from 'lucide-react';
import fs from 'fs';
import path from 'path';

export default async function ContactPage() {
  // Read company details from admin settings (same source as footer)
  const settingsConfigPath = path.join(process.cwd(), 'public', 'settings_config.json');
  let companyDetails = {
    company_name: 'VediCana Organics',
    company_address: 'Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India',
    company_phone: '+91 8249169354 | +91 8878923337',
    company_email: 'info@vedicana.com',
  };
  if (fs.existsSync(settingsConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(settingsConfigPath, 'utf8'));
      companyDetails = { ...companyDetails, ...config };
    } catch (e) {
      console.error('Failed to parse settings config:', e);
    }
  }

  return (
    <div className="bg-[#fbfcfa] min-h-screen pb-24 font-sans antialiased">

      {/* Page Header Banner */}
      <div className="bg-vedicana-dark-green py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fade-in">
          <span className="inline-block bg-vedicana-gold/15 text-vedicana-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-vedicana-gold/20">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow">Contact VediCana</h1>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full"></div>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4 font-light leading-relaxed">
            Have questions about our remedies, body type analysis, or orders? We are here to support your holistic wellness journey.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Contact Form (Client Component) */}
          <ContactFormSection />

          {/* Right Column: Office Coordinates */}
          <div className="lg:col-span-5 space-y-6">

            {/* Coordinates Card */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 space-y-6 hover:shadow-xl transition-all duration-300">
              <h3 className="font-serif font-bold text-gray-900 text-xl border-b border-gray-50 pb-3">Corporate Coordinates</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-vedicana-green/5 text-vedicana-green rounded-2xl border border-vedicana-green/10 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Headquarters Office</span>
                    <span className="block text-gray-700 font-serif text-[15px] font-semibold">{companyDetails.company_name}</span>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-light">
                      {companyDetails.company_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-vedicana-green/5 text-vedicana-green rounded-2xl border border-vedicana-green/10 flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Direct Telephone</span>
                    <p className="text-gray-700 font-serif text-sm font-semibold font-mono">
                      {companyDetails.company_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-vedicana-green/5 text-vedicana-green rounded-2xl border border-vedicana-green/10 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Email Support</span>
                    <p className="text-gray-700 font-serif text-sm font-semibold font-mono">
                      {companyDetails.company_email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-vedicana-green/5 text-vedicana-green rounded-2xl border border-vedicana-green/10 flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Working Hours</span>
                    <p className="text-gray-500 text-xs leading-relaxed font-light">
                      Monday – Saturday: 9:00 AM – 6:00 PM (IST)<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Standard Card */}
            <div className="bg-gradient-to-br from-vedicana-dark-green to-[#1b2a1a] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-5 translate-x-10 translate-y-10 pointer-events-none">
                <Sparkles size={160} />
              </div>
              <h4 className="font-serif font-bold text-vedicana-gold text-lg mb-2">Ayush &amp; WHO GMP Certified Manufacturing</h4>
              <p className="text-xs text-slate-300/90 leading-relaxed font-light">
                All VediCana formulations are manufactured in Ayush &amp; WHO GMP Certified Manufacturing units in compliance with international quality standards. We guarantee 100% natural, chemical-free herbal remedies focused on body balance.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
