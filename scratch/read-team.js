import sequelize from '../src/lib/sequelize.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

async function main() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'our-team' } });
    if (!page) {
      console.log('Page not found');
    } else {
      console.log('TITLE:', page.title);
      console.log('CONTENT:');
      console.log(page.content);
    }
  } catch (error) {
    console.error('Error fetching page:', error);
  } finally {
    await sequelize.close();
  }
}

main();
