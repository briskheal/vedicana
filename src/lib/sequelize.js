import { Sequelize } from 'sequelize';
import pg from 'pg';

let sequelize;

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vedicana';

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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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
