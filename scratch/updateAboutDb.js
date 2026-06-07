import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../src/models/index.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const cleanedPath = path.join(__dirname, '../scratch/cleaned_about.html');
    if (!fs.existsSync(cleanedPath)) {
      console.error("Cleaned about page HTML not found at:", cleanedPath);
      return;
    }
    const contentHtml = fs.readFileSync(cleanedPath, 'utf8');
    
    const [updatedCount] = await DiscoverPage.update(
      { content: contentHtml },
      { where: { slug: 'about' } }
    );
    
    if (updatedCount > 0) {
      console.log(`Success: Force-updated database about page content. New length: ${contentHtml.length}`);
    } else {
      console.log("Error: About page not found in database.");
    }
  } catch (err) {
    console.error("Error during force-update:", err);
  } finally {
    await sequelize.close();
  }
}

run();
