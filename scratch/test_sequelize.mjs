import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import sequelize from '../src/lib/sequelize.js';

async function check() {
  console.log("Sequelize config:", sequelize.config);
  try {
    await sequelize.authenticate();
    console.log("Authentication successful!");
  } catch (error) {
    console.error("Sequelize Test Error:", error.name, error.message);
  } finally {
    await sequelize.close();
  }
}

check();
