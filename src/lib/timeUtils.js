/**
 * Returns a new Date object mathematically shifted so its local methods 
 * (getHours, getDate, etc.) return the exact Indian Standard Time (IST) 
 * values regardless of the server's or client browser's local timezone.
 */
export const getISTTime = () => {
  const d = new Date();
  const options = { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric',
    hour12: false
  };
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(d);
    
    const getPart = (type) => parseInt(parts.find(p => p.type === type).value, 10);
    
    // hour might be 24 if midnight
    const hour = getPart('hour') === 24 ? 0 : getPart('hour');
    
    return new Date(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      hour,
      getPart('minute'),
      getPart('second')
    );
  } catch (e) {
    // Fallback if Intl is not supported (rare)
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5.5));
  }
};

/**
 * Common time slots used across the application for consultations.
 */
export const consultationTimeSlots = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM"
];

/**
 * Checks if a specific time slot string (e.g. "02:00 PM") has passed today in IST.
 * Useful for conditionally disabling UI elements.
 */
export const isSlotPassedIST = (slotStr, targetDateStr) => {
  if (!targetDateStr) return false;
  
  // Block Sundays (0 = Sunday)
  const [yyyyTarget, mmTarget, ddTarget] = targetDateStr.split('-');
  const targetDateObj = new Date(parseInt(yyyyTarget), parseInt(mmTarget) - 1, parseInt(ddTarget));
  if (targetDateObj.getDay() === 0) {
    return true;
  }
  
  const today = getISTTime();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  
  // If the selected date is in the future, the slot hasn't passed
  if (targetDateStr > todayStr) return false;
  // If the selected date is in the past, the slot has passed
  if (targetDateStr < todayStr) return true;
  
  // Target date is exactly today, so we compare times
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  
  const match = slotStr.match(/^(\d+):(\d+)\s+(AM|PM)$/i);
  if (!match) return false;
  
  let slotHour = parseInt(match[1], 10);
  const slotMinute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && slotHour !== 12) {
    slotHour += 12;
  } else if (ampm === 'AM' && slotHour === 12) {
    slotHour = 0;
  }
  
  if (slotHour < currentHour) return true;
  if (slotHour === currentHour && slotMinute <= currentMinute) return true;
  
  return false;
};
