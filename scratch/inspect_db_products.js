import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

async function run() {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'title', 'slug', 'image', 'gallery', 'description'],
      include: [Category]
    });
    console.log(`DB has ${products.length} products.`);
    const sample = products[0];
    if (sample) {
      console.log('Sample product:');
      console.log({
        id: sample.id,
        title: sample.title,
        slug: sample.slug,
        hasImage: !!sample.image,
        imageLength: sample.image ? sample.image.length : 0,
        gallery: sample.gallery,
        descriptionSnippet: sample.description ? sample.description.substring(0, 100) : null,
        Category: sample.Category ? sample.Category.name : null
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
