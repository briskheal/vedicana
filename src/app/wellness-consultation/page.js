"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, Sparkles, ShieldCheck, Flame, Heart, ArrowRight, ArrowLeft, CheckCircle, RefreshCcw } from 'lucide-react';
import { getISTTime, consultationTimeSlots, isSlotPassedIST } from '../../lib/timeUtils.js';

const topics = [
  {
    id: 'female_hygiene',
    title: 'Female Hygiene & Care',
    description: 'Confidential natural therapies, pH balancing, and hormonal wellness.',
    icon: <Sparkles className="text-vedicana-gold" size={20} />
  },
  {
    id: 'immunity_boost',
    title: 'Immunity & Vitality',
    description: 'Strengthen biological defenses and chronic fatigue recovery.',
    icon: <ShieldCheck className="text-[#0ea5e9]" size={20} />
  },
  {
    id: 'weight_management',
    title: 'Weight & Detox',
    description: 'Ignites slow metabolic processes (Kapha) and cleanses toxins.',
    icon: <Flame className="text-amber-500" size={20} />
  },
  {
    id: 'general_wellness',
    title: 'General Health & Ayurveda',
    description: 'Personalized dinacharya routines and balancing active doshas.',
    icon: <Heart className="text-emerald-500" size={20} />
  }
];

const timeSlots = consultationTimeSlots;

const getGoogleCalendarDates = (dateStr, timeSlotStr) => {
  if (!dateStr || !timeSlotStr) return '';
  
  const match = timeSlotStr.match(/^(\d+):(\d+)\s+(AM|PM)$/i);
  if (!match) return '';
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  
  // Format local IST ISO string: YYYY-MM-DDTHH:MM:00+05:30
  const isoString = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  const localDate = new Date(isoString);
  const endDate = new Date(localDate.getTime() + 30 * 60 * 1000); // 30 mins slot duration
  
  const toUtcFormat = (d) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const date = String(d.getUTCDate()).padStart(2, '0');
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${date}T${hh}${min}${ss}Z`;
  };
  
  return `${toUtcFormat(localDate)}/${toUtcFormat(endDate)}`;
};

export default function WellnessConsultation() {
  const [step, setStep] = useState(1); // 1: Topic, 2: Calendar & Slots, 3: Form, 4: Success
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [settings, setSettings] = useState({
    consultation_prefix: 'CNS-2026-',
    consultation_start_no: 1001
  });
  
  // Custom Calendar state
  const [currentDate, setCurrentDate] = useState(new Date()); // Used for calendar navigation (not exact time)
  const [selectedDateStr, setSelectedDateStr] = useState(''); // YYYY-MM-DD
  const [selectedSlot, setSelectedSlot] = useState('');
  
  // Set today's date (IST) as default on client mount
  useEffect(() => {
    const today = getISTTime();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);

    // Fetch settings for consultation prefix and starting serial number
    fetch('/api/admin/settings')
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          setSettings({
            consultation_prefix: data.consultation_prefix || 'CNS-2026-',
            consultation_start_no: data.consultation_start_no !== undefined ? Number(data.consultation_start_no) : 1001
          });
        }
      })
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  // Helper to determine if a time slot has already passed for the selected date
  const isSlotPassed = (slotStr, dateStr) => {
    return isSlotPassedIST(slotStr, dateStr);
  };

  useEffect(() => {
    if (selectedDateStr && selectedSlot) {
      if (isSlotPassed(selectedSlot, selectedDateStr)) {
        setSelectedSlot('');
      }
    }
  }, [selectedDateStr, selectedSlot]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [apptDetails, setApptDetails] = useState(null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const daysInMonth = getDaysArray();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDaySelect = (day) => {
    if (!day) return;
    const today = getISTTime();
    today.setHours(0, 0, 0, 0);
    
    if (day < today) return;

    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const isDaySelected = (day) => {
    if (!day) return false;
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    return selectedDateStr === `${yyyy}-${mm}-${dd}`;
  };

  const isDayDisabled = (day) => {
    if (!day) return true;
    if (day.getDay() === 0) return true; // Block Sundays
    const today = getISTTime();
    today.setHours(0, 0, 0, 0);
    return day < today;
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          topic: selectedTopic.title,
          date: selectedDateStr,
          timeSlot: selectedSlot,
          notes: formData.notes
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setApptDetails(data.appointment);
        setStep(4);
      } else {
        setSubmitError(data.error || 'This slot is already booked. Please choose another date or time slot.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to establish network connection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedTopic(null);
    setSelectedDateStr('');
    setSelectedSlot('');
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setApptDetails(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5fbf7] to-white py-6 sm:py-8 font-sans antialiased">
      <div className="max-w-[850px] mx-auto px-4">
        
        {/* Progress Header (Compressed Sizing) */}
        {step < 4 && (
          <div className="mb-5 text-center space-y-1.5">
            <span className="inline-block bg-vedicana-green/10 text-vedicana-green text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              VediCana Advisory
            </span>
            <h1 className="text-xl md:text-2xl font-serif text-vedicana-dark-green leading-tight font-bold">
              One-on-One Wellness Consultation
            </h1>
            <p className="text-gray-500 text-[11px] max-w-lg mx-auto font-light leading-relaxed hidden sm:block">
              Book an online session with VediCana's experienced advisors. Get customized natural guidance tailored to your body type.
            </p>
            
            {/* Step Wizard Dots */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    step === num 
                      ? 'bg-vedicana-green text-white ring-2 ring-emerald-100' 
                      : step > num 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > num ? '✓' : num}
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${step === num ? 'text-vedicana-green' : 'text-gray-400'}`}>
                    {num === 1 ? 'Topic' : num === 2 ? 'Date & Time' : 'Details'}
                  </span>
                  {num < 3 && <div className={`w-8 h-0.5 ${step > num ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Select Topic */}
        {step === 1 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-fade-in-up">
            <div className="border-b border-gray-50 pb-2 text-center md:text-left">
              <h2 className="text-lg font-serif text-gray-900 font-bold">Select a Consultation Focus</h2>
              <p className="text-[10px] text-gray-400 font-light">Choose the wellness discipline that fits your primary inquiries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 cursor-pointer relative overflow-hidden group ${
                    selectedTopic?.id === t.id
                      ? 'border-vedicana-green bg-vedicana-green/5 shadow-sm ring-1 ring-vedicana-green/20'
                      : 'border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-250 hover:shadow-sm'
                  }`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-150 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {t.icon}
                  </div>
                  <div className="space-y-1 pr-2">
                    <h3 className="font-serif font-bold text-gray-900 text-sm group-hover:text-vedicana-green transition-colors">{t.title}</h3>
                    <p className="text-[11px] text-gray-500 font-light leading-normal">{t.description}</p>
                  </div>
                  {selectedTopic?.id === t.id && (
                    <span className="absolute top-2.5 right-2.5 text-vedicana-green font-bold text-[9px] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-emerald-100 font-mono">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedTopic}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-xl shadow transition-transform hover:-translate-y-0.5 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Calendar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Calendar & Time Slots */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <div>
                <button onClick={() => setStep(1)} className="text-[10px] text-gray-400 hover:text-vedicana-green flex items-center gap-1 cursor-pointer">
                  <ArrowLeft size={11} /> Back to Topic
                </button>
                <h2 className="text-lg font-serif text-gray-900 font-bold">Select Date &amp; Time</h2>
              </div>
              <div className="bg-vedicana-green/10 text-vedicana-green text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {selectedTopic?.title}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Calendar Grid Left */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all cursor-pointer text-gray-500 hover:text-gray-900 font-bold text-xs">◀</button>
                  <span className="font-serif font-bold text-gray-800 text-xs md:text-sm">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all cursor-pointer text-gray-500 hover:text-gray-900 font-bold text-xs">▶</button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-0.5 font-mono">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;
                    const disabled = isDayDisabled(day);
                    const selected = isDaySelected(day);
                    
                    return (
                      <button
                        key={idx}
                        disabled={disabled}
                        onClick={() => handleDaySelect(day)}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all cursor-pointer font-mono ${
                          selected 
                            ? 'bg-vedicana-green text-white font-bold ring-2 ring-emerald-100 shadow-sm' 
                            : disabled 
                              ? 'text-gray-300 bg-gray-50/20 cursor-not-allowed' 
                              : 'text-gray-700 bg-gray-50/40 hover:bg-vedicana-green/10 hover:text-vedicana-green hover:font-bold border border-transparent hover:border-vedicana-green/20'
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Right */}
              <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-5">
                <h3 className="font-serif text-sm font-bold text-gray-800 flex items-center gap-1 border-b border-gray-50 pb-1.5">
                  <Clock size={14} className="text-vedicana-gold" /> Daily Slots (IST)
                </h3>

                {selectedDateStr ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-light font-mono">Date Selected: <span className="text-gray-900 font-bold ml-1">{new Date(selectedDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                      {timeSlots.map((slot) => {
                        const passed = isSlotPassed(slot, selectedDateStr);
                        if (passed) return null;
                        
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-center py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              selectedSlot === slot
                                ? 'bg-vedicana-gold text-white border-vedicana-gold shadow font-bold'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-vedicana-gold hover:text-vedicana-gold'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                      {timeSlots.every(slot => isSlotPassed(slot, selectedDateStr)) && (
                        <div className="col-span-2 text-center text-[10px] text-red-500 font-medium py-4 px-3 bg-red-50/50 rounded-xl border border-red-100/50 leading-normal">
                          Slots passed. Please pick a future date.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center gap-1.5">
                    <Calendar size={24} className="text-gray-300" />
                    <p className="text-[10px] font-light max-w-[150px] leading-relaxed">Select date to view slots.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-50">
              <button
                onClick={() => setStep(1)}
                className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest cursor-pointer px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDateStr || !selectedSlot}
                className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] px-6 py-3 rounded-xl shadow transition-transform hover:-translate-y-0.5 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Contact details & Notes Form */}
        {step === 3 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-md space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <div>
                <button onClick={() => setStep(2)} className="text-[10px] text-gray-400 hover:text-vedicana-green flex items-center gap-1 cursor-pointer">
                  <ArrowLeft size={11} /> Back to Date
                </button>
                <h2 className="text-lg font-serif text-gray-900 font-bold">Enter Details</h2>
              </div>
              <div className="bg-amber-500/10 text-amber-600 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} /> {new Date(selectedDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} @ {selectedSlot}
              </div>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-xl text-[10px] font-medium leading-relaxed font-mono">
                ⚠ {submitError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <User size={11} /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-3.5 py-2.5 text-xs"
                    placeholder="First and last name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Mail size={11} /> Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-3.5 py-2.5 text-xs"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Phone size={11} /> Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-3.5 py-2.5 text-xs"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <FileText size={11} /> Health Summary / Booking Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full border border-gray-200 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl px-3.5 py-2.5 text-xs resize-none"
                    placeholder="Provide a brief summary of symptoms or goals you wish to discuss."
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest cursor-pointer px-3 py-1.5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-vedicana-gold hover:bg-[#e69d00] text-white font-bold uppercase tracking-widest text-[11px] px-6 py-3 rounded-xl shadow transition-transform hover:-translate-y-0.5 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Call Booking'} <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Success Dialogue Modal */}
        {step === 4 && apptDetails && (
          <div className="bg-[#1b2a1a] text-white border border-emerald-950 rounded-2xl p-5 md:p-6 shadow-xl space-y-4 relative overflow-hidden animate-fade-in-up">
            
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-20 translate-y-20 pointer-events-none">
              <Sparkles size={200} className="text-white" />
            </div>

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex bg-emerald-600/30 text-emerald-400 p-2 rounded-full border border-emerald-500/20 mb-1">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Wellness Consultation Confirmed</h2>
              <div className="w-12 h-0.5 bg-vedicana-gold mx-auto rounded-full"></div>
              <p className="text-slate-350 text-[11px] max-w-sm mx-auto font-light leading-relaxed">
                Thank you, <strong className="text-white font-semibold">{apptDetails.name}</strong>. Your expert call has been scheduled successfully. An email confirmation has been sent.
              </p>
            </div>

            {/* Appointment Details Grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 space-y-3 max-w-sm mx-auto relative z-10">
              <h3 className="text-vedicana-gold font-bold uppercase tracking-wider text-[10px] font-mono border-b border-white/5 pb-1">Consultation Voucher</h3>
              
              <div className="grid grid-cols-3 gap-y-2 text-[11px] font-light">
                <span className="text-slate-400">Booking ID:</span>
                <span className="col-span-2 font-bold font-mono text-white">#{settings.consultation_prefix || 'CNS-2026-'}{(() => {
                  const startNo = settings.consultation_start_no !== undefined ? Number(settings.consultation_start_no) : 1001;
                  return startNo === 0 ? apptDetails.id : startNo + apptDetails.id - 1;
                })()}</span>

                <span className="text-slate-400">Topic:</span>
                <span className="col-span-2 font-medium text-white">{apptDetails.topic}</span>

                <span className="text-slate-400">Date Mapped:</span>
                <span className="col-span-2 font-medium text-white">
                  {new Date(apptDetails.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>

                <span className="text-slate-400">Time Slot:</span>
                <span className="col-span-2 font-bold text-vedicana-gold font-mono">{apptDetails.timeSlot} (IST)</span>

                <span className="text-slate-400">Advisory:</span>
                <span className="col-span-2 font-medium text-emerald-400 uppercase tracking-widest text-[9px] bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 w-fit rounded">Active Zoom Call</span>
              </div>
            </div>

            {/* Preparation Briefing checklist */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative z-10 max-w-md mx-auto space-y-1.5">
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-300 block">Health Advisory Briefing</span>
              <ul className="text-[10px] text-slate-300 font-light space-y-1 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-vedicana-gold font-bold">☉</span>
                  <span>Keep your medical files or prescription reports ready for reference.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-vedicana-gold font-bold">☉</span>
                  <span>Have a quiet corner with high-speed internet available for the call.</span>
                </li>
              </ul>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 relative z-10 pt-3 border-t border-white/5">
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=VediCana+Wellness+Consultation&dates=${getGoogleCalendarDates(apptDetails.date, apptDetails.timeSlot)}&details=Live+one-on-one+health+consultation+call+for+${encodeURIComponent(apptDetails.topic)}&location=Online+Zoom+Meeting`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center bg-vedicana-gold hover:bg-[#e69d00] text-slate-950 font-bold uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-lg transition-transform hover:-translate-y-0.5 shadow flex items-center justify-center gap-1"
              >
                Add to Calendar
              </a>
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white/80 hover:text-white px-5 py-2.5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCcw size={11} /> Book Another Call
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
