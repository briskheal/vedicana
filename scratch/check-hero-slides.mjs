// Script to query hero_slides table from the database
import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

const HeroSlide = sequelize.define('HeroSlide', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: true },
  subtitle: { type: DataTypes.STRING, allowNull: true },
  badge: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.TEXT, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: false, defaultValue: '/shop' },
  order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'hero_slides', timestamps: true });

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const slides = await HeroSlide.findAll({ order: [['order_index', 'ASC'], ['id', 'ASC']] });
    console.log(`\n📊 Found ${slides.length} hero slide(s) in database:\n`);

    slides.forEach((slide, i) => {
      const imgPreview = slide.image ? slide.image.substring(0, 80) + '...' : 'NO IMAGE';
      console.log(`[${i + 1}] ID: ${slide.id}`);
      console.log(`     Title: ${slide.title || '(none)'}`);
      console.log(`     Subtitle: ${slide.subtitle || '(none)'}`);
      console.log(`     Badge: ${slide.badge || '(none)'}`);
      console.log(`     Link: ${slide.link}`);
      console.log(`     Order: ${slide.order_index}`);
      console.log(`     Active: ${slide.is_active}`);
      console.log(`     Image: ${imgPreview}`);
      console.log('');
    });

    if (slides.length === 0) {
      console.log('❌ No hero slides found in database.');
      console.log('   The hero_slides table is empty — banners need to be re-uploaded.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
