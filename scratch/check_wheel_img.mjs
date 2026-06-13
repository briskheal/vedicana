import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const StoredImage = sequelize.define('StoredImage', {
  filename: { type: DataTypes.STRING },
  mimeType: { type: DataTypes.STRING },
}, { timestamps: true });

async function run() {
  try {
    const images = await StoredImage.findAll();
    console.log("Images in DB:");
    images.forEach(i => {
      console.log(`ID: ${i.id}, file: ${i.filename}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
