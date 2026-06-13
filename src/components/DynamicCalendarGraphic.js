"use client";
import React, { useState, useEffect } from 'react';
import { getISTTime, consultationTimeSlots, isSlotPassedIST } from '../lib/timeUtils.js';

export default function DynamicCalendarGraphic() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState(null);
  const [currentDateStr, setCurrentDateStr] = useState('');
  
  useEffect(() => {
    setMounted(true);
    const istTime = getISTTime();
    setToday(istTime);
    
    const yyyy = istTime.getFullYear();
    const mm = String(istTime.getMonth() + 1).padStart(2, '0');
    const dd = String(istTime.getDate()).padStart(2, '0');
    setCurrentDateStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  if (!mounted || !today) {
    // Skeleton matching the graphic shape
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-xl max-w-[340px] mx-auto h-[300px] animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl mb-4"></div>
        <div className="h-24 bg-gray-100 rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const currentMonthName = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(monday);
    tempDate.setDate(monday.getDate() + i);
    weekDates.push(tempDate);
  }

  // To match the old "active" slot highlight logic:
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;
  
  let activeTimeSlotIndex = 0;
  if (currentTimeVal >= 10 * 60 && currentTimeVal < 11.5 * 60) {
    activeTimeSlotIndex = 1;
  } else if (currentTimeVal >= 11.5 * 60 && currentTimeVal < 14 * 60) {
    activeTimeSlotIndex = 2;
  } else if (currentTimeVal >= 14 * 60 && currentTimeVal < 15.5 * 60) {
    activeTimeSlotIndex = 3;
  } else if (currentTimeVal >= 15.5 * 60 && currentTimeVal < 17 * 60) {
    activeTimeSlotIndex = 4;
  } else {
    activeTimeSlotIndex = 0;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-xl max-w-[340px] mx-auto space-y-4 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-vedicana-green/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
      
      {/* Advisor Status Card */}
      <div className="flex items-center gap-3 bg-gray-55/60 p-3 rounded-2xl border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vedicana-gold to-vedicana-green flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0">
          ZV
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
            Expert Advisors Online <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </h4>
          <p className="text-[10px] text-emerald-700 font-medium">Available for booking today</p>
        </div>
      </div>

      {/* Micro Calendar Grid */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center pb-1 border-b border-gray-50">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 font-mono">Dynamic Slots</span>
          <span className="text-[9px] font-bold text-vedicana-green uppercase font-sans tracking-wide">{currentMonthName} (IST)</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-400 font-mono pb-1">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((d, idx) => {
            const isToday = d.toDateString() === today.toDateString();
            const isPast = d < today && d.toDateString() !== today.toDateString();
            const isSunday = d.getDay() === 0;
            return (
              <div 
                key={idx} 
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-mono font-medium ${
                  isSunday
                    ? 'text-red-400 bg-red-50/50 line-through opacity-60 cursor-not-allowed'
                    : isToday 
                      ? 'bg-vedicana-gold text-white font-bold shadow-sm' 
                      : isPast 
                        ? 'text-gray-300 bg-gray-50/20 cursor-not-allowed' 
                        : 'text-gray-650 bg-gray-50/60'
                }`}
                title={isSunday ? "Closed on Sundays" : ""}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Hours */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {today.getDay() === 0 ? (
          <span className="text-[10px] font-bold text-red-500 uppercase px-3 py-1.5 bg-red-50 rounded border border-red-100 w-full text-center">
            Closed on Sundays
          </span>
        ) : (
          consultationTimeSlots.map((hour, idx) => {
            const isPassed = isSlotPassedIST(hour, currentDateStr);
            const isActive = !isPassed && idx === activeTimeSlotIndex;
            
            return (
              <span 
                key={idx} 
                className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border font-mono transition-all ${
                  isPassed
                    ? 'bg-gray-50 border-gray-200 text-gray-400 line-through opacity-70 cursor-not-allowed'
                    : isActive 
                      ? 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309] font-bold shadow-xs' 
                      : 'bg-green-50 border-green-100 text-green-700'
                }`}
              >
                {hour}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
