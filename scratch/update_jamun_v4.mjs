import models from '../src/models/index.js';
import fs from 'fs';

const PATH = 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\vedicana_jamun_honey_v4_1781406342146.png';

async function updateJamun() {
  const products = await models.Product.findAll();
  
  if (fs.existsSync(PATH)) {
    const fileData = fs.readFileSync(PATH);
    const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;

    const honey = products.find(p => p.title && p.title.toLowerCase().includes('jamun honey'));
    if (honey) {
      honey.image = base64Image;
      await honey.save();
      console.log(`Successfully updated the image for: ${honey.title}`);
    } else {
      console.log(`Jamun Honey not found in the database!`);
    }
  } else {
    console.log(`Image not found at path: ${PATH}`);
  }
}

updateJamun().catch(console.error).finally(() => process.exit(0));
