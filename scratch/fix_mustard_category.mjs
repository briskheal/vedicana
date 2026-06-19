import models from '../src/models/index.js';

async function check() {
  const categories = await models.Category.findAll();
  console.log("Available categories:", categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  const honeyCategory = categories.find(c => c.name.toLowerCase().includes('honey'));
  if (honeyCategory) {
    console.log("Found Honey Category:", honeyCategory.id);
    const mustard = await models.Product.findOne({ where: { slug: 'vedicana-mustard-honey' } });
    if (mustard) {
      mustard.categoryId = honeyCategory.id;
      await mustard.save();
      console.log("Updated Mustard Honey with category ID:", honeyCategory.id);
    }
  } else {
    console.log("Could not find a category containing 'honey'!");
  }
}

check().catch(console.error).finally(() => process.exit(0));
