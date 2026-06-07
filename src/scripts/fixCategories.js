import 'dotenv/config';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

async function fixCategories() {
  try {
    console.log("Fetching live products from vedicana.com...");
    const res = await fetch('https://vedicana.com/wp-json/wc/store/products?per_page=100');
    if (!res.ok) {
      throw new Error(`WooCommerce API returned status ${res.status}`);
    }
    const wcProducts = await res.json();
    console.log(`Found ${wcProducts.length} products on WooCommerce.`);

    // 1. Fetch all existing categories from the database
    const categories = await Category.findAll();
    const catMap = {};
    for (const cat of categories) {
      catMap[cat.name.toLowerCase()] = cat;
    }

    // 2. Loop through WooCommerce products and process categories
    for (const wcProd of wcProducts) {
      if (wcProd.categories && wcProd.categories.length > 0) {
        const wcCat = wcProd.categories[0];
        const catName = wcCat.name;
        const catSlug = wcCat.slug;
        const catKey = catName.toLowerCase();

        let dbCategory = catMap[catKey];

        // If category doesn't exist, create it in DB
        if (!dbCategory) {
          console.log(`Category "${catName}" not found in database. Creating...`);
          dbCategory = await Category.create({
            name: catName,
            slug: catSlug,
            description: `${catName} Ayurvedic Products`
          });
          catMap[catKey] = dbCategory;
        }

        // Find the product in the local database by slug
        const dbProduct = await Product.findOne({
          where: { slug: wcProd.slug }
        });

        if (dbProduct) {
          // Update the categoryId for the product
          await Product.update(
            { categoryId: dbCategory.id },
            { where: { id: dbProduct.id } }
          );
          console.log(`[SUCCESS] Associated: "${wcProd.name}" -> Category: "${catName}"`);
        } else {
          console.log(`[WARNING] Product "${wcProd.name}" (${wcProd.slug}) not found in database. Skipping association.`);
        }
      }
    }

    console.log("\n✅ All product categories successfully updated!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to fix categories:", error);
    process.exit(1);
  }
}

fixCategories();
