import models from '../src/models/index.js';
import fs from 'fs';
import path from 'path';

const PUBLIC_PRODUCTS_DIR = path.join(process.cwd(), 'public', 'images', 'products');

async function migrateImages() {
  if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
    fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
    console.log(`Created directory: ${PUBLIC_PRODUCTS_DIR}`);
  }

  // Fetch only IDs first to avoid loading huge base64 payloads all at once
  const productMeta = await models.Product.findAll({
    attributes: ['id', 'title', 'slug']
  });
  
  console.log(`Found ${productMeta.length} products to check.`);

  let migratedCount = 0;

  for (const meta of productMeta) {
    try {
      console.log(`Checking ${meta.title}...`);
      
      // Fetch full product object including image
      const product = await models.Product.findByPk(meta.id);
      
      if (product && product.image && product.image.startsWith('data:image/')) {
        const matches = product.image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.log(`Skipping ${product.title} - Invalid base64 format.`);
          continue;
        }

        let extension = matches[1];
        if (extension === 'jpeg') extension = 'jpg';
        if (extension === 'webp') extension = 'png'; // Some might be webp inside png? Let's keep the real extension.
        
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `${product.slug}.${extension}`;
        const filePath = path.join(PUBLIC_PRODUCTS_DIR, filename);
        
        fs.writeFileSync(filePath, buffer);
        console.log(`Saved image to ${filePath}`);
        
        const publicUrl = `/images/products/${filename}`;
        product.image = publicUrl;
        await product.save();
        console.log(`Updated DB for ${product.title} with URL: ${publicUrl}`);
        
        migratedCount++;
      } else {
        console.log(`Skipping ${meta.title} - Image is already a URL or empty.`);
      }
    } catch (err) {
      console.error(`Error migrating image for ${meta.title}:`, err);
    }
  }

  console.log(`\nMigration complete. Migrated ${migratedCount} images.`);
}

migrateImages().catch(console.error).finally(() => process.exit(0));
