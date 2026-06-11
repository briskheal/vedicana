// Seed hero slides with newly generated banner images
import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Banner definitions
const banners = [
  {
    file: 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\banner_ghee_1781180958775.png',
    title: 'Sudh Gir Cow Ghee',
    subtitle: '100% Natural • A2 Milk • Ayurvedic',
    badge: 'WHO GMP Certified',
    link: '/shop',
    order_index: 1
  },
  {
    file: 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\banner_hair_oil_1781180971093.png',
    title: 'Herbal Hair Oil',
    subtitle: 'Strength • Growth • Shine',
    badge: '100% Natural',
    link: '/shop',
    order_index: 2
  },
  {
    file: 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\banner_essential_oil_1781180984776.png',
    title: 'Pure Essential Oils',
    subtitle: 'Aromatherapy • Wellness • Purity',
    badge: 'Chemical Free',
    link: '/shop',
    order_index: 3
  },
  {
    file: 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\banner_triphala_1781180998626.png',
    title: 'Triphala Tablets',
    subtitle: 'Digestion • Detox • Immunity',
    badge: 'Ayush Certified',
    link: '/shop',
    order_index: 4
  }
];

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Delete old broken slides (IDs 9-12)
    const deleted = await HeroSlide.destroy({ where: { id: [9, 10, 11, 12] } });
    console.log(`🗑️  Deleted ${deleted} old broken slide(s)\n`);

    // Insert new slides with base64 images
    for (const banner of banners) {
      if (!fs.existsSync(banner.file)) {
        console.error(`❌ File not found: ${banner.file}`);
        continue;
      }

      const imageBuffer = fs.readFileSync(banner.file);
      const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      const slide = await HeroSlide.create({
        title: banner.title,
        subtitle: banner.subtitle,
        badge: banner.badge,
        image: base64,
        link: banner.link,
        order_index: banner.order_index,
        is_active: true
      });

      console.log(`✅ Inserted: "${banner.title}" (ID: ${slide.id}, ${Math.round(base64.length / 1024)}KB)`);
    }

    console.log('\n🎉 All hero slides seeded successfully!');
    console.log('   Admin portal → Hero Banners should now show all 4 banners.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
