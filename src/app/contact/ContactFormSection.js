"use client";
import React, { useState } from 'react';
import { Send, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactFormSection() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', bot_honeypot: '' });
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setNum1(Math.floor(Math.random() * 8) + 2);
    setNum2(Math.floor(Math.random() * 8) + 1);
  }, [isSubmitted]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(captchaInput, 10) !== num1 + num2) {
      setError('Security check failed. Please enter the correct math sum.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let token = '';
      if (executeRecaptcha) {
        token = await executeRecaptcha('contact');
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken: token }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setIsSubmitted(true);
        setCaptchaInput('');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '', bot_honeypot: '' });
    setCaptchaInput('');
    setIsSubmitted(false);
    setError('');
  };

  return (
    <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100/80">
      {isSubmitted ? (
        <div className="text-center py-12 space-y-6 animate-fade-in-up">
          <div className="inline-flex bg-emerald-500/10 text-vedicana-green p-4 rounded-full border border-emerald-500/20 mb-2">
            <CheckCircle size={48} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-wide">Message Sent!</h2>
          <div className="w-12 h-0.5 bg-vedicana-gold mx-auto rounded-full"></div>
          <p className="text-gray-500 text-sm max-w-md mx-auto font-light leading-relaxed">
            Thank you, <strong className="text-gray-900 font-semibold">{formData.name}</strong>. Your message has been dispatched to our team. We will reply within <strong>24–48 hours</strong>. Check your inbox for a confirmation email.
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
            <p className="text-xs text-gray-400 mt-1 font-light">Fill out the form below and we'll get back to you within 24–48 hours.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Name *</label>
                <input
                  required type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Email *</label>
                <input
                  required type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                  placeholder="e.g. rahul@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject *</label>
              <input
                required type="text" name="subject" value={formData.subject} onChange={handleChange}
                className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all"
                placeholder="e.g. Product Prescription or Order Query"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Message *</label>
              <textarea
                required name="message" value={formData.message} onChange={handleChange} rows="5"
                className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-4 py-3 text-sm transition-all resize-none"
                placeholder="Detail your questions or wellness feedback here..."
              />
            </div>

            {/* Invisible Honeypot for spam bots */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="bot_honeypot" value={formData.bot_honeypot || ''} onChange={handleChange} tabIndex="-1" autoComplete="off" placeholder="Leave empty" />
            </div>

            {/* Security Captcha Challenge */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl flex items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                🛡️ Security Check: What is {num1} + {num2}? *
              </label>
              <input
                required
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="?"
                className="w-20 border border-emerald-300 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg px-3 py-1.5 text-sm font-bold text-center bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full md:w-auto bg-vedicana-green hover:bg-vedicana-dark-green text-white font-bold uppercase tracking-widest text-xs md:text-sm px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Message <Send size={14} /></>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
