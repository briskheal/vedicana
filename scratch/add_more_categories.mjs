import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import models from '../src/models/index.js';

const { PopularCategory, sequelize } = models;

async function processImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Compress and convert to WebP
  const webpBuffer = await sharp(imageBuffer)
    .resize({ width: 400, height: 400, fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
}

async function addOrUpdateCategory(name, slug, description, imagePath) {
  const base64Image = await processImage(imagePath);
  
  const existing = await PopularCategory.findOne({ where: { slug } });
  if (existing) {
    await existing.update({ name, image: base64Image, description });
    console.log(`Updated existing category: ${name}`);
  } else {
    await PopularCategory.create({
      name,
      slug,
      description,
      image: base64Image,
      shape: 'round'
    });
    console.log(`Created new category: ${name}`);
  }
}

async function run() {
  try {
    const womensHealthImg = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/womens_health_thumbnail_1781350461611.png';
    const dailyNeedsImg = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/daily_needs_thumbnail_1781350475751.png';

    await addOrUpdateCategory("Women's Health", 'womens-health', 'Women Care', womensHealthImg);
    await addOrUpdateCategory("Daily Needs", 'daily-needs', 'Pure Organic', dailyNeedsImg);

  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
