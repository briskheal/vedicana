import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';

const DATABASE_URL = 'postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

const Mantra = sequelize.define('Mantra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'audio/mpeg',
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
}, {
  timestamps: true,
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    await Mantra.sync({ alter: true });
    console.log('Mantra table synced');

    // Seed data
    const filesToUpload = [
      { filename: 'root_lam.mp3', title: 'Lam (Root Chakra)' },
      { filename: 'sacral_vam.mp3', title: 'Vam (Sacral Chakra)' },
      { filename: 'solar_ram.mp3', title: 'Ram (Solar Plexus Chakra)' },
      { filename: 'heart_yam.mp3', title: 'Yam (Heart Chakra)' }
    ];

    for (const file of filesToUpload) {
      const filePath = path.join(process.cwd(), 'public/audio', file.filename);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const existing = await Mantra.findOne({ where: { filename: file.filename } });
        if (!existing) {
          await Mantra.create({
            title: file.title,
            filename: file.filename,
            mimeType: 'audio/mpeg',
            data: buffer
          });
          console.log(`Uploaded ${file.filename}`);
        } else {
          console.log(`${file.filename} already exists`);
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}

run();
