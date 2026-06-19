import models from '../src/models/index.js';
import fs from 'fs';

const PATH = 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\';

const images = {
  'Saffron Honey': PATH + 'vedicana_saffron_honey_v2_1781359160971.png',
  'Multiflora Honey': PATH + 'vedicana_multiflora_honey_v2_1781359657572.png',
  'Jamun Honey': PATH + 'vedicana_jamun_honey_v2_1781359614988.png',
  'Tulsi Honey': PATH + 'vedicana_tulsi_honey_v2_1781359643972.png',
  'Ajwain Honey': PATH + 'vedicana_ajwain_honey_v2_1781359629984.png',
};

async function updateAllHoney() {
  const products = await models.Product.findAll();

  for (const [key, imgPath] of Object.entries(images)) {
    if (fs.existsSync(imgPath)) {
      const fileData = fs.readFileSync(imgPath);
      const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;

      const honey = products.find(p => p.title && p.title.toLowerCase().includes(key.toLowerCase()));
      if (honey) {
        honey.image = base64Image;
        await honey.save();
        console.log(`Successfully updated the image for: ${honey.title}`);
      } else {
        console.log(`${key} not found in the database!`);
      }
    } else {
      console.log(`Image not found at path for ${key}: ${imgPath}`);
    }
  }
}

updateAllHoney().catch(console.error).finally(() => process.exit(0));
