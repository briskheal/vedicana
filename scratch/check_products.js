import sequelize from '../src/lib/sequelize.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

async function check() {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }]
    });
    
    console.log(`Found ${products.length} products in DB.`);
    
    let linkedCount = 0;
    products.forEach(p => {
      const categoryName = p.Category ? p.Category.name : 'NULL';
      console.log(` - Product: "${p.title}" | categoryId: ${p.categoryId} | Category Name: "${categoryName}"`);
      if (p.Category) linkedCount++;
    });
    
    console.log(`\nLinked products: ${linkedCount} / ${products.length}`);
  } catch (err) {
    console.error('Error fetching products and categories:', err);
  } finally {
    process.exit(0);
  }
}

check();
