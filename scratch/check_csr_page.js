import 'dotenv/config';
import models from '../src/models/index.js';
const { DiscoverPage } = models;

async function check() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'csr-and-philanthropy' } });
    if (page) {
      console.log("PAGE FOUND:");
      console.log("Title:", page.title);
      console.log("Is Active:", page.is_active);
      console.log("Content Length:", page.content.length);
      console.log("Content HTML:\n", page.content);
    } else {
      console.log("csr-and-philanthropy page not found in database.");
    }
  } catch (err) {
    console.error("Error fetching page:", err);
  } finally {
    if (models.sequelize) {
      await models.sequelize.close();
    }
    process.exit(0);
  }
}

check();
