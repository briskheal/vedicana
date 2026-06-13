import models from '../src/models/index.js';

async function check() {
  const products = await models.Product.findAll();
  const jamun = products.filter(p => p.description && p.description.includes('Jamun Honey'));
  
  if (jamun.length > 0) {
    console.log("Found in Product:", jamun[0].name);
    console.log("Is featured?", jamun[0].is_featured);
  } else {
    console.log("Not found in Products.");
  }
}

check().catch(console.error).finally(() => process.exit(0));
