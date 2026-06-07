import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import DiscoverPage from '../src/models/DiscoverPage.js';

async function cleanup() {
  console.log('[Branding Cleanup] Initiating standardizations...');

  // 1. Scan and clean HTML files in scratch/discover_pages/
  const dirPath = path.join(__dirname, 'discover_pages');
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      console.log(`Processing file: ${file}...`);
      let content = fs.readFileSync(filePath, 'utf8');

      // Remove the menu item list item for Ziva VediCana completely
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !line.includes('id="menu-item-6904"') && !line.includes('ziva-VediCana'));
      let cleaned = filteredLines.join('\n');

      // Standardize Ziva branding references
      // "Ziva VediCana" -> "VediCana"
      cleaned = cleaned.replace(/Ziva\s+VediCana/gi, 'VediCana');
      // "Ziva Innovations" -> "VediCana Innovations"
      cleaned = cleaned.replace(/Ziva\s+Innovations/gi, 'VediCana Innovations');
      // "Ziva Wellness" -> "VediCana Wellness"
      cleaned = cleaned.replace(/Ziva\s+Wellness/gi, 'VediCana Wellness');
      // Any leftover "Ziva" (case-insensitive) -> "VediCana"
      cleaned = cleaned.replace(/Ziva/gi, 'VediCana');

      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`  [CLEANED] Saved standardized HTML copy for: ${file}`);
    }
  } else {
    console.log('[Warning] discover_pages directory not found at:', dirPath);
  }

  // 2. Delete ziva-vedicana record from dynamic DiscoverPage database table
  try {
    console.log('Connecting to PostgreSQL database to delete "ziva-vedicana" dynamic page record...');
    const deletedCount = await DiscoverPage.destroy({
      where: { slug: 'ziva-vedicana' }
    });
    console.log(`  [DATABASE PURGE] Successfully deleted ${deletedCount} record(s) matching slug "ziva-vedicana".`);
  } catch (err) {
    console.error('[Error] Database purge operation failed:', err);
  }

  console.log('[Branding Cleanup] Tasks completed successfully!');
}

cleanup();
