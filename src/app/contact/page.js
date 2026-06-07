"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate database/API persist
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <div className="bg-[#fbfcfa] min-h-screen pb-24 font-sans antialiased">
      {/* Page Header Banner */}
      <div className="bg-vedicana-dark-green py-20 text-center relative overflow-hidden">
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
          
          {/* Left Column: Glassmorphic Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100/80">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-6 animate-fade-in-up">
                <div className="inline-flex bg-emerald-500/10 text-vedicana-green p-4 rounded-full border border-emerald-500/20 mb-2">
                  <CheckCircle size={48} className="animate-bounce" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Message Received!</h2>
                <div className="w-12 h-0.5 bg-vedicana-gold mx-auto rounded-full"></div>
                <p className="text-gray-500 text-sm max-w-md mx-auto font-light leading-relaxed">
                  Thank you, <strong className="text-gray-900 font-semibold">{formData.name}</strong>. Your wellness inquiry has been dispatched to our expert advisory team. We will get back to you shortly.
                </p>
                <div className="pt-6">
                  <button
                    onClick={handleReset}
                    className="bg-vedicana-green hover:bg-vedicana-dark-green text-white font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl shadow-md transition-all duration-300 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-4 text-center md:text-left">
                  <h2 className="text-2xl font-serif text-gray-900 font-semibold flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="text-vedicana-gold" size={20} />
                    Send Us a Message
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 font-light">Fill out the credentials below to submit your health or order inquiries.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Name *</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Email *</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                        placeholder="e.g. rahul@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject *</label>
                    <input
                      required
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                      placeholder="e.g. Product Prescription or Order Query"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Message *</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all resize-none"
                      placeholder="Detail your questions or wellness feedback here..."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto bg-vedicana-green hover:bg-vedicana-dark-green text-white font-bold uppercase tracking-widest text-xs md:text-sm px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

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
                    <span className="block text-gray-700 font-serif text-[15px] font-semibold">VediCana Organics</span>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-light">
                      Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India
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
                      +91 8249169354 <span className="text-slate-300 font-sans font-light mx-1">|</span> +91 8878923337
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
                      info@vedicana.com
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
              <h4 className="font-serif font-bold text-vedicana-gold text-lg mb-2">Ayush &amp; FDA Certified Manufacturing</h4>
              <p className="text-xs text-slate-300/90 leading-relaxed font-light">
                All VediCana formulations are manufactured in compliance with international quality standards. We guarantee 100% natural, chemical-free herbal remedies focused on body balance.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
