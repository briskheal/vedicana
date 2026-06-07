import { Sequelize } from 'sequelize';

const ipv6Url = 'postgres://postgres:VedicanaOrganics%401306@[2406:da1c:4c7:f800:bd9c:4d90:5186:d670]:5432/postgres';

console.log('Testing direct IPv6 connection...');
const sequelize = new Sequelize(ipv6Url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('Successfully connected via direct IPv6 address!');
  })
  .catch(err => {
    console.error('Failed to connect via IPv6 address:', err);
  })
  .finally(() => {
    sequelize.close();
  });
