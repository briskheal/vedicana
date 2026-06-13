import models from '../src/models/index.js';
import fs from 'fs';

async function check() {
  const products = await models.Product.findAll();
  const jamun = products.filter(p => p.title && p.title.toLowerCase().includes('jamun honey'));
  
  if (jamun.length > 0 && jamun[0].image) {
    console.log("Image URL:", jamun[0].image.substring(0, 50) + "...");
    
    // if it's base64, save it to a file
    if (jamun[0].image.startsWith('data:image')) {
      const base64Data = jamun[0].image.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync('./scratch/jamun_honey.png', base64Data, 'base64');
      console.log("Saved base64 image to scratch/jamun_honey.png");
    } else {
      console.log("It's a regular URL. Please download it using curl.");
      console.log(jamun[0].image);
    }
  } else {
    console.log("No Jamun Honey image found.");
  }
}

check().catch(console.error).finally(() => process.exit(0));
