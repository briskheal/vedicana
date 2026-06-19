import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

import models, { sequelize } from '../src/models/index.js';

async function syncAll() {
  try {
    console.log("Syncing database...");
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully!");
  } catch (error) {
    console.error("Failed to sync database:", error);
  } finally {
    await sequelize.close();
  }
}

syncAll();
