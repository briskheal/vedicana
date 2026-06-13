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

    // Remove the div wrapper around the duplicate image entirely
    html = html.replace(/<div class="img-wrap[^>]*>\s*<img src="\/uploads\/discover\/discover-vedic-culture_1780120149992\.webp"[^>]*>\s*<\/div>/gi, '');
    html = html.replace(/<div class="img-wrap[^>]*>\s*<img src="\/api\/images\/13"[^>]*>\s*<\/div>/gi, '');

    await DiscoverPage.update({ content: html }, { where: { slug: 'discover-vedic-culture' } });
    console.log('Successfully removed the duplicate image!');
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
