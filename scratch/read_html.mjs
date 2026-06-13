import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';

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
    if (page) {
      fs.writeFileSync('scratch/live_html.html', page.content);
      console.log('Saved to scratch/live_html.html');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
