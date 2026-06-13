const d = new Date();
const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
const ist = new Date(utc + (3600000 * 5.5));
console.log("Method 1 Hour:", ist.getHours());

const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' };
const f = new Intl.DateTimeFormat('en-US', options);
console.log("Intl Hour:", f.format(d));
