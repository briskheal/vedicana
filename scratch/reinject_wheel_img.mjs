import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const DiscoverPage = sequelize.define('DiscoverPage', {
  slug: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
}, { timestamps: true });

async function run() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'discover-vedic-culture' } });
    if (!page) return;

    let html = page.content;

    // Remove any previously broken image injections if any (just in case)
    html = html.replace(/<div class="img-wrap img-center">\s*<img src="\/api\/images\/13"[^>]*>\s*<\/div>/g, '');

    // Insert Image 13 right before "The Essential Mantras You Need For Each Of The 7 Chakras"
    const targetString = '<h2 class="banner-title">The Essential Mantras You Need For Each Of The 7 Chakras</h2>';
    const imageHtml = '\n\n<div class="img-wrap img-center" style="margin: 2rem auto; text-align: center;">\n  <img src="/api/images/13" alt="Chakra Wheel Chart" style="max-width: 100%; border-radius: 8px;" />\n</div>\n\n';

    if (html.includes(targetString)) {
      html = html.replace(targetString, imageHtml + targetString);
      await DiscoverPage.update({ content: html }, { where: { slug: 'discover-vedic-culture' } });
      console.log('Successfully re-injected Image 13 (Chakra Wheel reading chart) into the page!');
    } else {
      console.log('Target string not found in HTML.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
