import 'dotenv/config';
import models from '../models/index.js';

async function updateGst() {
  try {
    const { Product } = models;
    const [count] = await Product.update({ tax_rate: 5 }, { where: {} });
    console.log(`Successfully updated ${count} products to 5% GST.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to update GST rates:', error);
    process.exit(1);
  }
}

updateGst();
