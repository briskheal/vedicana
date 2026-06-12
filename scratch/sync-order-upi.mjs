import 'dotenv/config';
import Order from '../src/models/Order.js';
import sequelize from '../src/lib/sequelize.js';

async function sync() {
  try {
    console.log('🔄 Syncing Order table to add UPI columns and enums...');
    // We use force: false, alter: true to preserve data but add columns
    // Postgres enums can be tricky to alter. If it fails, we will need raw queries.
    await Order.sync({ alter: true });
    console.log('✅ Order table updated successfully!');
  } catch (error) {
    console.error('❌ Error syncing Order table:', error);
  } finally {
    await sequelize.close();
  }
}

sync();
