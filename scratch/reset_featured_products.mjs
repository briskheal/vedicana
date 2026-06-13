import models from '../src/models/index.js';

const { Product, sequelize } = models;

async function run() {
  try {
    const updatedCount = await Product.update(
      { is_featured: false },
      { where: {} } // Update all records
    );
    console.log(`Successfully reset is_featured to false for all products. Updated rows: ${updatedCount[0] || updatedCount}`);
  } catch (error) {
    console.error('Error resetting featured products:', error);
  } finally {
    await sequelize.close();
  }
}

run();
