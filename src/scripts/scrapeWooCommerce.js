import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import Models
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';

async function fetchImageAsWebpBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const webpBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
      
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    return null;
  }
}

async function scrapeAndSeed() {
  try {
    console.log("Connecting to PostgreSQL...");
    // Sync DB without dropping users or orders, but wipe Products and Categories
    await Category.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    console.log("Wiped old dummy products and categories.");

    console.log("Fetching live products from vedicana.com...");
    const res = await fetch('https://vedicana.com/wp-json/wc/store/products?per_page=100');
    const wcProducts = await res.json();
    console.log(`Found ${wcProducts.length} products on WooCommerce.`);

    // Keep track of categories we create
    const categoryMap = {};

    for (const wcProd of wcProducts) {
      console.log(`Processing: ${wcProd.name}...`);

      // 1. Process Categories
      let primaryCategoryId = null;
      if (wcProd.categories && wcProd.categories.length > 0) {
        const catName = wcProd.categories[0].name;
        if (!categoryMap[catName]) {
          const newCat = await Category.create({
            name: catName,
            slug: wcProd.categories[0].slug,
            description: `${catName} Ayurvedic Products`
          });
          categoryMap[catName] = newCat.id;
        }
        primaryCategoryId = categoryMap[catName];
      }

      // 2. Process Image
      let base64Image = null;
      if (wcProd.images && wcProd.images.length > 0) {
        console.log(`  Downloading image: ${wcProd.images[0].src}`);
        base64Image = await fetchImageAsWebpBase64(wcProd.images[0].src);
      }

      // 3. Process Price
      // WooCommerce REST API returns prices in minor units (e.g. 34200 for 342.00)
      const priceVal = parseFloat(wcProd.prices.price) / (10 ** wcProd.prices.currency_minor_unit || 100);

      // 4. Create Product
      await Product.create({
        title: wcProd.name,
        slug: wcProd.slug,
        description: wcProd.short_description || wcProd.description, // Store HTML
        price: priceVal,
        sale_price: priceVal,
        stock: 50, // Default stock
        image: base64Image,
        is_featured: true, // Make all scraped products featured for now to show on homepage
        CategoryId: primaryCategoryId
      });
      
      console.log(`  Successfully saved ${wcProd.name} to Postgres.`);
    }

    console.log("\n✅ WooCommerce Scraping and Database Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("Scraping failed:", error);
    process.exit(1);
  }
}

scrapeAndSeed();
