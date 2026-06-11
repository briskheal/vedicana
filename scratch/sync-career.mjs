import 'dotenv/config';
import CareerApplication from '../src/models/CareerApplication.js';
import sequelize from '../src/lib/sequelize.js';

async function sync() {
  try {
    console.log('🔄 Syncing CareerApplication table...');
    await CareerApplication.sync({ alter: true });
    console.log('✅ CareerApplication table synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing CareerApplication:', error);
  } finally {
    await sequelize.close();
  }
}

sync();
