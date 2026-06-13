import models from '../src/models/index.js';

const { PopularCategory, sequelize } = models;

async function run() {
  try {
    const honeyCat = await PopularCategory.findOne({ where: { slug: 'honey-corner' } });
    if (honeyCat) {
      await honeyCat.update({ description: 'Natural Pure Honey' });
      console.log('Successfully updated Honey Corner description to "Natural Pure Honey"');
    } else {
      console.log('Could not find Honey Corner category in database');
    }
    
    const all = await PopularCategory.findAll();
    console.log('Current Popular Categories:');
    all.forEach(c => {
      console.log(`- ${c.name}: ${c.description || 'No description'}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
