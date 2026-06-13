import models from '../src/models/index.js';

async function check() {
  const products = await models.Product.findAll();
  const jamun = products.filter(p => {
    const nameMatch = p.name && p.name.toLowerCase().includes('jamun');
    const descMatch = p.description && p.description.toLowerCase().includes('jamun');
    return nameMatch || descMatch;
  });
  
  console.log("Products found:", jamun.map(p => p.name));
  
  if (jamun.length > 0) {
    console.log("Is featured?", jamun[0].is_featured);
    console.log("Description:", jamun[0].description);
  } else {
    console.log("No Jamun Honey product found in the database.");
  }
}

check().catch(console.error).finally(() => process.exit(0));
