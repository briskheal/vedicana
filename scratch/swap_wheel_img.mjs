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

    // Replace Image 13 with the original discover-vedic-culture wheel image
    if (html.includes('/api/images/13')) {
      html = html.replace('/api/images/13', '/uploads/discover/discover-vedic-culture_1780120149992.webp');
      await DiscoverPage.update({ content: html }, { where: { slug: 'discover-vedic-culture' } });
      console.log('Successfully swapped the image to the original wheel photo!');
    } else {
      console.log('Target image not found in HTML.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
