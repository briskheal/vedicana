import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import sequelize from '../src/lib/sequelize.js';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';

async function testProfile() {
  try {
    const user = await User.findByPk(1, {
      include: [{ model: Order, as: 'Orders', separate: true, order: [['createdAt', 'DESC']] }]
    });
    console.log("Found user:", user ? "yes" : "no");
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
  } finally {
    await sequelize.close();
  }
}

testProfile();
