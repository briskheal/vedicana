import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Category from '../src/models/Category.js';

async function list() {
  try {
    const categories = await Category.findAll();
    console.log('Categories in DB:');
    categories.forEach(c => {
      console.log(`  - ${c.name} (slug: "${c.slug}")`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
list();
