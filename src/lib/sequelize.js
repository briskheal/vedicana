import { Sequelize } from 'sequelize';
import pg from 'pg';

let sequelize;

let dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vedicana';

// Force port 5432 because Supabase deprecated IPv4 pooling on 6543 which causes ECONNREFUSED
if (dbUrl.includes('.supabase.com:6543')) {
  dbUrl = dbUrl.replace(':6543', ':5432');
}

const sequelizeOptions = {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 1,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
};

// Use a global singleton across both development AND production.
// Next.js App Router evaluates server component modules multiple times;
// without a global singleton, production server chunks spawn 20+ separate connection pools,
// instantly triggering Supabase's (EMAXCONNSESSION) max clients reached limit (pool_size: 15).
if (!global.sequelizeGlobalInstance) {
  global.sequelizeGlobalInstance = new Sequelize(dbUrl, sequelizeOptions);
}
sequelize = global.sequelizeGlobalInstance;

export default sequelize;

