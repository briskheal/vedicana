import models from '../src/models/index.js';

async function check() {
  const products = await models.Product.findAll();
  const jamun = products.filter(p => p.title && p.title.toLowerCase().includes('jamun honey'));
  
  if (jamun.length > 0) {
    console.log("Found in Product:", jamun[0].title);
    console.log("Description:", jamun[0].description);
  } else {
    console.log("Not found in Products.");
  }
}

check().catch(console.error).finally(() => process.exit(0));
