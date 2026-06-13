import { getISTTime, isSlotPassedIST, consultationTimeSlots } from '../src/lib/timeUtils.js';

const today = getISTTime();
console.log("IST Time reported as:", today.toString());
console.log("IST Hour:", today.getHours());
console.log("IST Minute:", today.getMinutes());

const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;
console.log("Today String:", todayStr);

consultationTimeSlots.forEach(slot => {
  const isPassed = isSlotPassedIST(slot, todayStr);
  console.log(`Slot: ${slot} | Passed: ${isPassed}`);
});
