import 'dotenv/config';
import models, { sequelize } from '../src/models/index.js';

const { Product } = models;

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    const count = await Product.count();
    console.log(`Number of products: ${count}`);
    const products = await Product.findAll();
    let withSpec = 0;
    let withAddInfo = 0;
    let emptySpecSlugs = [];

    products.forEach(p => {
      if (p.specification && p.specification.trim()) {
        withSpec++;
      } else {
        emptySpecSlugs.push(p.slug);
      }
      if (p.additional_info && Object.keys(p.additional_info).length > 0) {
        withAddInfo++;
      }
    });

    console.log(`Summary of ${products.length} products:`);
    console.log(`- Products with specifications: ${withSpec}`);
    console.log(`- Products with additional_info: ${withAddInfo}`);
    console.log(`- Sample slugs without specifications: ${emptySpecSlugs.slice(0, 10).join(', ')}`);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

test();
