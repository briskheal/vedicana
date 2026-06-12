import 'dotenv/config';
import Product from '../src/models/Product.js';
import sequelize from '../src/lib/sequelize.js';

async function sync() {
  try {
    console.log('🔄 Adding is_active column to products table...');
    await Product.sync({ alter: true });
    console.log('✅ Products table updated! is_active column added (all existing products set to visible by default).');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

sync();
