import { Sequelize } from 'sequelize';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize("postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres", {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

// Override the lib/sequelize instance
User.sequelize = sequelize;

async function check() {
  try {
    const user = await User.findOne({ where: { email: 'jrdash.ctc@gmail.com' } });
    if (user) {
      console.log('User found:', user.email);
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

check();
