import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
});

const StoredImage = sequelize.define('StoredImage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  filename: { type: DataTypes.STRING, allowNull: false },
  mimeType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'image/webp' },
  data: { type: DataTypes.BLOB('long'), allowNull: false },
}, { timestamps: true });

const DiscoverPage = sequelize.define('DiscoverPage', {
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

async function uploadImage(imagePath, name) {
  const buffer = fs.readFileSync(imagePath);
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const storedImage = await StoredImage.create({
    filename: `${name}.webp`,
    mimeType: 'image/webp',
    data: compressedBuffer
  });
  console.log(`Uploaded ${name} -> ID: ${storedImage.id}`);
  return storedImage.id;
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const img1Path = String.raw`C:\Users\J S DASH\.gemini\antigravity\brain\39249ead-7316-4fbe-b96b-f310e201354a\ayurveda_herbs_oils_1781317434471.png`;
    const img2Path = String.raw`C:\Users\J S DASH\.gemini\antigravity\brain\39249ead-7316-4fbe-b96b-f310e201354a\ayurveda_spices_1781317446139.png`;
    const img3Path = String.raw`C:\Users\J S DASH\.gemini\antigravity\brain\39249ead-7316-4fbe-b96b-f310e201354a\ayurveda_meditation_1781317741018.png`;

    const id1 = await uploadImage(img1Path, 'ayurveda_herbs');
    const id2 = await uploadImage(img2Path, 'ayurveda_spices');
    const id3 = await uploadImage(img3Path, 'ayurveda_meditation');

    // Load original HTML
    const originalHtmlPath = path.join(process.cwd(), 'scratch/discover_pages/discover-ayurveda.html');
    let rawHtml = fs.readFileSync(originalHtmlPath, 'utf8');

    // Replace the 3 old WordPress images
    // 1st Image (Right aligned, wrapped with text)
    rawHtml = rawHtml.replace(
      /<div class="img-wrap img-left"><img src="https:\/\/i0\.wp\.com\/VediCana\.com\/wp-content\/uploads\/2021\/12\/2-1-1\.png[^>]+><\/div>/,
      `<img src="/api/images/${id1}" alt="Ayurvedic Herbs" style="float: right; width: 45%; max-width: 450px; border-radius: 12px; margin: 5px 0 15px 25px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`
    );

    // 2nd Image (Left aligned, wrapped with text)
    rawHtml = rawHtml.replace(
      /<div class="img-wrap img-left"><img src="https:\/\/i0\.wp\.com\/VediCana\.com\/wp-content\/uploads\/2021\/12\/1-1-1\.png[^>]+><\/div>/,
      `<img src="/api/images/${id2}" alt="Ayurvedic Spices" style="float: left; width: 45%; max-width: 450px; border-radius: 12px; margin: 5px 25px 15px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`
    );

    // 3rd Image (Right aligned, wrapped with text)
    rawHtml = rawHtml.replace(
      /<div class="img-wrap img-left"><img src="https:\/\/i0\.wp\.com\/VediCana\.com\/wp-content\/uploads\/2021\/12\/3-1-1\.png[^>]+><\/div>/,
      `<img src="/api/images/${id3}" alt="Ayurvedic Meditation" style="float: right; width: 45%; max-width: 450px; border-radius: 12px; margin: 5px 0 15px 25px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />`
    );

    await DiscoverPage.update(
      { content: rawHtml },
      { where: { slug: 'discover-ayurveda' } }
    );
    console.log("Successfully restored original content with new beautifully aligned images!");
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await sequelize.close();
  }
}

run();
