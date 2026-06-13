import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const PopularCategory = sequelize.define('PopularCategory', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  image: { type: DataTypes.TEXT, allowNull: false },
  shape: { type: DataTypes.STRING, allowNull: false, defaultValue: 'round' },
}, { tableName: 'popular_categories', timestamps: true });

async function run() {
  try {
    const imagePath = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/honey_corner_thumbnail_1781349599587.png';
    
    if (!fs.existsSync(imagePath)) {
      console.log('Image not found');
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    
    // Compress and convert to WebP
    const webpBuffer = await sharp(imageBuffer)
      .resize({ width: 400, height: 400, fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const base64Image = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

    const existing = await PopularCategory.findOne({ where: { slug: 'honey-corner' } });
    if (existing) {
      await existing.update({ image: base64Image, name: 'Honey Corner' });
      console.log('Updated existing Honey Corner popular category');
    } else {
      await PopularCategory.create({
        name: 'Honey Corner',
        slug: 'honey-corner',
        image: base64Image,
        shape: 'round'
      });
      console.log('Created new Honey Corner popular category');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
