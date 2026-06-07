import 'dotenv/config';
import { sequelize } from '../models/index.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import sharp from 'sharp';

// Helper to download image and convert to Base64 WEBP
async function processImage(url) {
  console.log(`Downloading and converting to WebP: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to webp
    const webpBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
      
    // Return Base64 data URI
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (err) {
    console.error(`Failed to process ${url}:`, err.message);
    return null;
  }
}

async function seed() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    
    console.log('Syncing database...');
    // Force true will drop the table if it already exists
    await sequelize.sync({ force: true });
    
    console.log('Creating Categories...');
    const skincare = await Category.create({
      name: 'Skin Care',
      slug: 'skin-care',
      description: 'Natural, glowing skin remedies.',
      image: await processImage('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80')
    });
    
    const haircare = await Category.create({
      name: 'Hair Care',
      slug: 'hair-care',
      description: 'Deep nourishment for strong hair.',
      image: await processImage('https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80')
    });
    
    const wellness = await Category.create({
      name: 'Wellness',
      slug: 'wellness',
      description: 'Ayurvedic immunity and wellness.',
      image: await processImage('https://images.unsplash.com/photo-1611078516086-4e1b8b8b8b8b?auto=format&fit=crop&w=800&q=80')
    });

    console.log('Creating Products...');
    const products = [
      {
        title: 'Kumkumadi Tailam',
        slug: 'kumkumadi-tailam',
        description: 'A miraculous blend of saffron and rare Ayurvedic herbs that brings a natural glow to your skin.',
        price: 1299.00,
        sale_price: 1100.00,
        stock: 50,
        is_featured: true,
        categoryId: skincare.id,
        imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Bhringraj Hair Oil',
        slug: 'bhringraj-hair-oil',
        description: 'Clinically proven to reduce hair fall and promote hair growth using pure Bhringraj extract.',
        price: 449.00,
        stock: 120,
        is_featured: true,
        categoryId: haircare.id,
        imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Ashwagandha Extract',
        slug: 'ashwagandha-extract',
        description: 'A powerful adaptogen to relieve stress, boost immunity, and improve vitality.',
        price: 599.00,
        stock: 200,
        is_featured: true,
        categoryId: wellness.id,
        imageUrl: 'https://images.unsplash.com/photo-1611078516086-4e1b8b8b8b8b?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const p of products) {
      const webpImage = await processImage(p.imageUrl);
      await Product.create({
        ...p,
        image: webpImage,
      });
      console.log(`Created product: ${p.title}`);
    }

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
