import 'dotenv/config';
import { sequelize } from '../src/models/index.js';

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Run raw query to add ENUM value 'returned' to 'enum_Orders_status'
    try {
      await sequelize.query('ALTER TYPE "enum_Orders_status" ADD VALUE \'returned\'');
      console.log("Successfully altered ENUM type and added 'returned' value.");
    } catch (queryErr) {
      if (queryErr.message.includes('already contains') || queryErr.message.includes('already exists')) {
        console.log("Value 'returned' already exists in ENUM type. Ignoring.");
      } else {
        throw queryErr;
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
