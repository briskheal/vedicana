import { Sequelize } from 'sequelize';

const poolerUrl = 'postgres://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

console.log('Testing connection to pooler in ap-south-1 region...');
const sequelize = new Sequelize(poolerUrl, {
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
    console.log('Successfully connected to the database pooler!');
  })
  .catch(err => {
    console.error('Failed to connect to pooler:', err);
  })
  .finally(() => {
    sequelize.close();
  });
