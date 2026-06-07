import 'dotenv/config';
import models, { sequelize } from '../models/index.js';

const { Certification } = models;

const defaultCertifications = [
  {
    title: 'WHO GMP',
    image: 'https://cdn-icons-png.flaticon.com/512/2912/2912795.png',
    order_index: 1
  },
  {
    title: 'Organic',
    image: 'https://cdn-icons-png.flaticon.com/512/892/892926.png',
    order_index: 2
  },
  {
    title: 'Cruelty Free',
    image: 'https://cdn-icons-png.flaticon.com/512/825/825590.png',
    order_index: 3
  },
  {
    title: 'Chemical Free',
    image: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png',
    order_index: 4
  },
  {
    title: 'Sustainable',
    image: 'https://cdn-icons-png.flaticon.com/512/2913/2913564.png',
    order_index: 5
  },
  {
    title: 'SSL Secure',
    image: 'https://cdn-icons-png.flaticon.com/512/2504/2504932.png',
    order_index: 6
  },
  {
    title: 'Child Labor Free',
    image: 'https://cdn-icons-png.flaticon.com/512/3209/3209935.png',
    order_index: 7
  },
  {
    title: 'COA Certified',
    image: 'https://cdn-icons-png.flaticon.com/512/2912/2912778.png',
    order_index: 8
  },
  {
    title: '100% Natural',
    image: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png',
    order_index: 9
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Clear existing certifications
    await Certification.destroy({ where: {} });
    console.log('Cleared existing certifications.');

    // Insert default certifications
    await Certification.bulkCreate(defaultCertifications);
    console.log('Successfully seeded 9 default certifications.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding certifications:', error);
    process.exit(1);
  }
}

seed();
