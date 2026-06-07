import 'dotenv/config';
import { sequelize } from '../src/models/index.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

async function run() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'about' } });
    if (page) {
      const hasJourney = page.content.includes("Join us on this journey");
      const hasInquiries = page.content.includes("For any inquiries");
      console.log(`Database has Journey paragraph: ${hasJourney}`);
      console.log(`Database has Inquiries paragraph: ${hasInquiries}`);
      console.log("Length of page content:", page.content.length);
    } else {
      console.log("about page not found.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sequelize.close();
  }
}

run();
