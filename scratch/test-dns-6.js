import dns from 'dns';
import sequelize from '../src/lib/sequelize.js';

console.log('Resolving AAAA (IPv6) records...');
dns.resolve6('db.oeuelrgzxtogwmotdomd.supabase.co', (err, addresses) => {
  if (err) {
    console.error('dns.resolve6 failed:', err);
  } else {
    console.log('dns.resolve6 addresses:', addresses);
  }
});
