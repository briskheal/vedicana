const getISTTime = () => {
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
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(d);
  
  const getPart = (type) => parseInt(parts.find(p => p.type === type).value, 10);
  
  const hour = getPart('hour') === 24 ? 0 : getPart('hour');
  
  return new Date(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    hour,
    getPart('minute'),
    getPart('second')
  );
};

const d = getISTTime();
console.log("Year:", d.getFullYear());
console.log("Month:", d.getMonth());
console.log("Date:", d.getDate());
console.log("Hour:", d.getHours());
console.log("Minute:", d.getMinutes());
