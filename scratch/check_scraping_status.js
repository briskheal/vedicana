import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import Product from '../src/models/Product.js';
import { Op } from 'sequelize';

async function check() {
  try {
    const totalCount = await Product.count();
    const updatedCount = await Product.count({
      where: {
        gallery: {
          [Op.ne]: null
        }
      }
    });
    
    console.log(`=== SCRAPING PROGRESS ===`);
    console.log(`Total Products: ${totalCount}`);
    console.log(`Products with Gallery Updated: ${updatedCount} (${((updatedCount / totalCount) * 100).toFixed(1)}%)`);
    
    if (updatedCount < totalCount) {
      // Find a few that are still null
      const remaining = await Product.findAll({
        where: { gallery: null },
        limit: 5,
        attributes: ['id', 'title', 'slug']
      });
      console.log('Sample remaining products:');
      remaining.forEach(p => console.log(`  - ${p.title} (${p.slug})`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
