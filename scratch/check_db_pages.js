import '../src/scripts/loadEnv.js';
import DiscoverPage from '../src/models/DiscoverPage.js';
import { sequelize } from '../src/models/index.js';

async function check() {
  try {
    const pages = await DiscoverPage.findAll();
    for (const page of pages) {
      console.log(`\n===================================`);
      console.log(`Page: ${page.title} (Slug: ${page.slug})`);
      console.log(`Content Length: ${page.content ? page.content.length : 0}`);
      if (page.content) {
        const hasVcSection = page.content.includes('vc_section');
        const hasVcRow = page.content.includes('vc_row');
        const hasWpbColumn = page.content.includes('wpb_column');
        console.log(`- has vc_section: ${hasVcSection}`);
        console.log(`- has vc_row: ${hasVcRow}`);
        console.log(`- has wpb_column: ${hasWpbColumn}`);
        
        if (hasVcSection || hasVcRow || hasWpbColumn) {
          console.log(`- Sample of content containing legacy wrapper:`);
          const index = page.content.indexOf('vc_');
          console.log(page.content.substring(Math.max(0, index - 50), Math.min(page.content.length, index + 350)));
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
