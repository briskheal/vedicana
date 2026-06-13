import models from '../src/models/index.js';
import fs from 'fs';

async function updateSaffronHoney() {
  const imagePath = 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\vedicana_saffron_honey_1781358439195.png';
  let base64Image = '';
  
  if (fs.existsSync(imagePath)) {
    const fileData = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
  } else {
    console.log("Image not found at path!");
    return;
  }

  const products = await models.Product.findAll();
  const saffron = products.find(p => p.title && p.title.toLowerCase().includes('saffron honey'));

  if (saffron) {
    saffron.image = base64Image;
    await saffron.save();
    console.log("Successfully updated the image for:", saffron.title);
  } else {
    console.log("Saffron Honey not found in the database!");
  }
}

updateSaffronHoney().catch(console.error).finally(() => process.exit(0));
