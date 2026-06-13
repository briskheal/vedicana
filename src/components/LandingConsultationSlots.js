"use client";
import React, { useState, useEffect } from 'react';
import { getISTTime, consultationTimeSlots, isSlotPassedIST } from '../lib/timeUtils.js';

export default function LandingConsultationSlots() {
  const [mounted, setMounted] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const today = getISTTime();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setCurrentDateStr(`${yyyy}-${mm}-${dd}`);

    const options = { month: 'short', day: 'numeric' };
    setFormattedDate(`Today, ${today.toLocaleDateString('en-US', options)} (IST)`);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by showing a skeleton or nothing before client mounts
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex-1 opacity-50">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Count available slots
  const availableSlots = consultationTimeSlots.filter(
    (slot) => !isSlotPassedIST(slot, currentDateStr)
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex-1 relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-vedicana-gold/10 blur-xl group-hover:bg-vedicana-gold/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif font-bold text-gray-900">{formattedDate}</h3>
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${availableSlots.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {availableSlots.length > 0 ? `${availableSlots.length} Slots Left` : 'Fully Booked'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {consultationTimeSlots.map((slot, index) => {
            const isPassed = isSlotPassedIST(slot, currentDateStr);
            return (
              <span 
                key={index}
                className={`py-2 px-1 text-center rounded-lg text-sm transition-all ${
                  isPassed 
                  ? 'bg-gray-50 border border-gray-200 text-gray-400 line-through opacity-70 cursor-not-allowed' 
                  : 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] font-bold shadow-sm'
                }`}
                title={isPassed ? "Slot has passed" : "Slot available"}
              >
                {slot}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
