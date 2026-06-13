import fs from 'fs';
import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const DiscoverPage = sequelize.define('DiscoverPage', {
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

async function run() {
  try {
    const page = await DiscoverPage.findOne({ where: { slug: 'discover-ayurveda' } });
    if (page) {
      fs.writeFileSync('scratch/current_ayurveda_html.html', page.content, 'utf8');
      console.log('Saved to scratch/current_ayurveda_html.html');
    } else {
      console.log('Page not found!');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
