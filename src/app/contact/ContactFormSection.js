"use client";
import React, { useState } from 'react';
import { Send, CheckCircle, Sparkles } from 'lucide-react';

export default function ContactFormSection() {
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
  );
}
