import models from '../src/models/index.js';

const { PopularCategory, Category, sequelize } = models;

async function run() {
  try {
    // List all popular categories to see what we have
    const popularCats = await PopularCategory.findAll();
    console.log('Popular Categories:', popularCats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

    // List all actual categories
    const cats = await Category.findAll();
    console.log('Categories:', cats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

    // Find the one to update
    const classicalOil = await PopularCategory.findOne({ where: { slug: 'classical-oils' } });
    if (classicalOil) {
      // Find the correct slug for "Essential Oils"
      const essentialOilCat = cats.find(c => c.name.toLowerCase().includes('essential'));
      const newSlug = essentialOilCat ? essentialOilCat.slug : 'essential-oils';

      await classicalOil.update({ name: 'Essential Oils', slug: newSlug });
      console.log('Successfully updated "Classical Oils" to "Essential Oils" with slug:', newSlug);
    } else {
      console.log('Could not find popular category with slug "classical-oils"');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
