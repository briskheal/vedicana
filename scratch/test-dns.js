import dns from 'dns';
import sequelize from '../src/lib/sequelize.js';

console.log('Testing DNS lookup via dns.lookup...');
dns.lookup('db.oeuelrgzxtogwmotdomd.supabase.co', (err, address, family) => {
  if (err) {
    console.error('dns.lookup failed:', err);
  } else {
    console.log('dns.lookup address:', address, 'family:', family);
  }
});

console.log('Testing DNS resolve via dns.resolve...');
dns.resolve('db.oeuelrgzxtogwmotdomd.supabase.co', (err, addresses) => {
  if (err) {
    console.error('dns.resolve failed:', err);
  } else {
    console.log('dns.resolve addresses:', addresses);
  }
});

console.log('Testing database connection via sequelize...');
sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database via Sequelize:', err);
  })
  .finally(() => {
    sequelize.close();
  });
