import 'dotenv/config';
import models, { sequelize } from '../models/index.js';

const { HeroSlide } = models;

const defaultSlides = [
  {
    title: '',
    subtitle: '',
    badge: '',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-1.png',
    link: '/shop',
    order_index: 1,
    is_active: true
  },
  {
    title: '',
    subtitle: '',
    badge: '',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-2.png',
    link: '/shop',
    order_index: 2,
    is_active: true
  },
  {
    title: '',
    subtitle: '',
    badge: '',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-3.png',
    link: '/shop',
    order_index: 3,
    is_active: true
  },
  {
    title: '',
    subtitle: '',
    badge: '',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-4.png',
    link: '/shop',
    order_index: 4,
    is_active: true
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Clear existing slides
    await HeroSlide.destroy({ where: {} });
    console.log('Cleared existing hero slides.');

    // Insert default slides
    await HeroSlide.bulkCreate(defaultSlides);
    console.log('Successfully seeded default hero slides.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hero slides:', error);
    process.exit(1);
  }
}

seed();
