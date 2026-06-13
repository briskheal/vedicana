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
    const page = await DiscoverPage.findOne({ where: { slug: 'discover-vedic-culture' } });
    if (!page) {
      console.log('Page not found!');
      return;
    }

    let html = page.content;

    // The audio template
    const getAudio = (file) => ` <audio controls style="height: 30px; margin-left: 15px; vertical-align: middle; max-width: 200px;"><source src="/audio/${file}.mp3" type="audio/mpeg"></audio>`;

    html = html.replace(
      /(Root Chakra – I Am\.\s*\.\.\.)/i,
      `$1${getAudio('root_lam')}`
    );
    html = html.replace(
      /(Sacral Chakra – I Feel\.\s*\.\.\.)/i,
      `$1${getAudio('sacral_vam')}`
    );
    html = html.replace(
      /(Solar Plexus Chakra – I Do\.\s*\.\.\.)/i,
      `$1${getAudio('solar_ram')}`
    );
    html = html.replace(
      /(Heart Chakra – I Love\.\s*\.\.\.)/i,
      `$1${getAudio('heart_yam')}`
    );
    html = html.replace(
      /(Throat Chakra – I Speak\.\s*\.\.\.)/i,
      `$1${getAudio('throat_ham')}`
    );
    html = html.replace(
      /(Third Eye Chakra – I see\.\s*\.\.\.)/i,
      `$1${getAudio('thirdeye_om')}`
    );
    html = html.replace(
      /(Crown Chakra – I understand…)/i,
      `$1${getAudio('crown_ah')}`
    );

    // Give some spacing to the list items so the audio players look good
    html = html.replace(/<li class="mpc-list__item/g, '<li style="margin-bottom: 12px; display: flex; align-items: center; flex-wrap: wrap;" class="mpc-list__item');

    await DiscoverPage.update(
      { content: html },
      { where: { slug: 'discover-vedic-culture' } }
    );
    
    console.log('Successfully injected audio tags!');
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
