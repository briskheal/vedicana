import models from '../src/models/index.js';

async function check() {
  const products = await models.Product.findAll({
    where: {
      slug: 'vedicana-mustard-honey'
    }
  });
  if (products.length > 0) {
    console.log("Found Mustard Honey:");
    console.log(JSON.stringify(products[0], null, 2));
  } else {
    console.log("Mustard Honey not found in DB.");
  }
}

check().catch(console.error).finally(() => process.exit(0));
