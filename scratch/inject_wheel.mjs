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
    if (!page) return;

    let html = page.content;
    
    // Check if it's already there
    if (!html.includes('<!-- CHAKRA_WHEEL -->')) {
      // Find the end of the UL containing the chakras.
      // We can just look for the end of the Crown Chakra li, and then the </ul>
      const insertionPoint = html.indexOf('</ul>', html.indexOf('Crown Chakra'));
      if (insertionPoint !== -1) {
        // Insert right after the </ul>
        const newHtml = html.slice(0, insertionPoint + 5) + '\n\n<!-- CHAKRA_WHEEL -->\n\n' + html.slice(insertionPoint + 5);
        
        await DiscoverPage.update(
          { content: newHtml },
          { where: { slug: 'discover-vedic-culture' } }
        );
        console.log('Successfully injected <!-- CHAKRA_WHEEL -->!');
      } else {
        console.log('Could not find insertion point.');
      }
    } else {
      console.log('CHAKRA_WHEEL marker already exists.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
