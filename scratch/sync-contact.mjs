import 'dotenv/config';
import ContactMessage from '../src/models/ContactMessage.js';
import sequelize from '../src/lib/sequelize.js';

async function sync() {
  try {
    console.log('🔄 Syncing ContactMessage table...');
    await ContactMessage.sync({ alter: true });
    console.log('✅ ContactMessage table synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing ContactMessage:', error);
  } finally {
    await sequelize.close();
  }
}

sync();
