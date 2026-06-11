// Seed the first wellness blog post with generated banner image
import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';

const DATABASE_URL = "postgresql://postgres.oeuelrgzxtogwmotdomd:VedicanaOrganics%401306@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

const Blog = sequelize.define('Blog', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:        { type: DataTypes.STRING,  allowNull: false },
  slug:         { type: DataTypes.STRING,  allowNull: false, unique: true },
  excerpt:      { type: DataTypes.TEXT,    allowNull: true },
  content:      { type: DataTypes.TEXT,    allowNull: true },
  cover_image:  { type: DataTypes.TEXT,    allowNull: true },
  author:       { type: DataTypes.STRING,  allowNull: false, defaultValue: 'VediCana Team' },
  category:     { type: DataTypes.STRING,  allowNull: true,  defaultValue: 'Wellness' },
  tags:         { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
  status:       { type: DataTypes.ENUM('draft','published','scheduled'), allowNull: false, defaultValue: 'draft' },
  scheduled_at: { type: DataTypes.DATE,    allowNull: true },
  published_at: { type: DataTypes.DATE,    allowNull: true },
  read_time:    { type: DataTypes.INTEGER, allowNull: true,  defaultValue: 5 },
  views:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_featured:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'blogs', timestamps: true });

const BANNER_PATH = 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\blog_wellness_banner_1781182326133.png';

const CONTENT = `## What Is Natural Therapy?

Natural therapy — also known as naturopathy or holistic healing — is a system of healthcare that works with the body's inherent ability to heal itself. It draws on the ancient science of Ayurveda, using herbs, minerals, diet, lifestyle, and yoga to restore balance and promote long-term wellness.

Unlike synthetic medicines that often suppress symptoms, natural therapy addresses the **root cause** of illness — bringing the body, mind, and spirit back into harmony.

---

## The Ayurvedic Foundation

Ayurveda, the 5,000-year-old Indian system of medicine, is the backbone of natural therapy. It classifies every individual into one of three primary constitutional types — **Vata**, **Pitta**, and **Kapha** — and recommends personalised herbs, foods, and routines based on your unique Prakriti (nature).

This individualized approach is what sets natural therapy apart from one-size-fits-all conventional medicine.

---

## 7 Key Advantages of Natural Therapy

### 1. 🌿 Treats the Root Cause
Natural therapy doesn't just mask symptoms. It identifies and corrects the underlying imbalance — whether that's poor digestion, stress, toxin accumulation, or nutritional deficiency.

### 2. 💊 Zero Harmful Side Effects
Herbs like Ashwagandha, Triphala, Neem, and Turmeric have been used safely for thousands of years. When taken correctly, they carry no toxic burden on the liver or kidneys — unlike many pharmaceutical drugs.

### 3. 🧠 Supports Mental Wellness
Adaptogenic herbs such as Brahmi, Shankhpushpi, and Ashwagandha are clinically proven to reduce cortisol (the stress hormone), improve focus, and promote restful sleep.

### 4. 🔥 Improves Digestion & Metabolism
Triphala, Trikatu, and Ajwain are time-tested digestive tonics. A healthy gut is the foundation of overall health — natural therapy has always known this, long before modern medicine recognised it.

### 5. 🛡️ Strengthens Immunity Naturally
Gir Cow Ghee, Chyawanprash, Amla, and Giloy are powerful immunity-building ingredients. They enhance the body's natural defence mechanisms rather than bypassing them.

### 6. ♻️ Detoxifies the Body
Panchakarma therapies, herbal teas, and Triphala help flush out accumulated Ama (toxins) from tissues and channels — restoring cellular health and energy.

### 7. 🌱 Sustainable Long-Term Health
Natural therapy builds lasting health — not dependency. Once the body is in balance, it maintains itself with simple dietary and lifestyle practices.

---

## VediCana's Commitment to Natural Wellness

At VediCana Organics, every product is formulated using **authentic Ayurvedic principles**, sourced from certified organic farms, and manufactured in **Ayush & WHO GMP Certified** units.

Whether it is our **Sudh Gir Cow Ghee** — rich in A2 protein and butyric acid — our **Herbal Hair Oil** packed with Bhringraj and Brahmi, or our **Triphala Tablets** for daily detox, every offering is designed to bring you closer to nature's healing wisdom.

---

## Getting Started with Natural Therapy

- **Know your Prakriti** → Take our [Ayurvedic Quiz](/prakriti)
- **Book a consultation** → Speak to our Ayurvedic expert at [Wellness Consultation](/wellness-consultation)
- **Explore our products** → Browse our [Shop](/shop)

*True wellness is not the absence of disease — it is the presence of vitality, clarity, and joy. Let nature lead the way.*

— **VediCana Wellness Team**`;

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    await Blog.sync({ alter: true });

    // Check if post already exists
    const existing = await Blog.findOne({ where: { slug: 'wellness-and-advantages-of-natural-therapy' } });
    if (existing) {
      console.log('⚠️  Post already exists (ID:', existing.id, '). Updating to published...');
      await existing.update({ status: 'published', published_at: new Date(), is_featured: true });
      console.log('✅ Updated to published + featured!');
      return;
    }

    // Load cover image as base64
    let coverImage = null;
    if (fs.existsSync(BANNER_PATH)) {
      const buf = fs.readFileSync(BANNER_PATH);
      coverImage = `data:image/png;base64,${buf.toString('base64')}`;
      console.log(`📷 Cover image loaded (${Math.round(buf.length / 1024)} KB)`);
    } else {
      console.log('⚠️  Banner image not found, posting without cover image');
    }

    const post = await Blog.create({
      title:        'Wellness and Advantages of Natural Therapy',
      slug:         'wellness-and-advantages-of-natural-therapy',
      excerpt:      'Discover how Ayurvedic natural therapy heals from the root — no side effects, sustainable results, and 5,000 years of proven wisdom. A deep dive into why nature always knows best.',
      content:      CONTENT,
      cover_image:  coverImage,
      author:       'VediCana Wellness Team',
      category:     'Wellness',
      tags:         ['ayurveda', 'natural therapy', 'wellness', 'herbal', 'holistic health'],
      status:       'published',
      published_at: new Date(),
      read_time:    7,
      views:        0,
      is_featured:  true,
    });

    console.log(`\n🎉 Blog post published successfully!`);
    console.log(`   ID:       ${post.id}`);
    console.log(`   Title:    ${post.title}`);
    console.log(`   Slug:     ${post.slug}`);
    console.log(`   Status:   ${post.status}`);
    console.log(`   Featured: ${post.is_featured}`);
    console.log(`\n   Visit: https://vedicana.com/blog/${post.slug}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

main();
