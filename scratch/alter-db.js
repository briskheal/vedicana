import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/lib/sequelize.js';

async function alterDb() {
  try {
    await sequelize.query('ALTER TABLE "Users" ADD COLUMN points INTEGER DEFAULT 0;');
    console.log("Column 'points' added successfully.");
  } catch (error) {
    if (error.message && (error.message.includes('already exists') || error.message.includes('column "points" of relation "Users" already exists'))) {
      console.log("Column 'points' already exists.");
    } else {
      console.error("Error altering DB:", error);
    }
  } finally {
    await sequelize.close();
  }
}

alterDb();
