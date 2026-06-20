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
    max: 10,
    min: 1,
    acquire: 60000,
    idle: 60000
  }
};

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(dbUrl, sequelizeOptions);
} else {
  // In development, use a global variable to preserve the Sequelize instance
  // across hot reloads, preventing connection pool accumulation and timeouts.
  if (!global.sequelizeGlobalInstance) {
    global.sequelizeGlobalInstance = new Sequelize(dbUrl, sequelizeOptions);
  }
  sequelize = global.sequelizeGlobalInstance;
}

export default sequelize;
