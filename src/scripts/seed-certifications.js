import 'dotenv/config';
import models, { sequelize } from '../models/index.js';

const { Certification } = models;

const defaultCertifications = [
  {
    title: 'WHO GMP',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/Add-a-subheading-6.png',
    order_index: 1
  },
  {
    title: 'Organic',
    image: 'https://vedicana.com/wp-content/uploads/cache/2024/08/Add-a-subheading/1378270865.png',
    order_index: 2
  },
  {
    title: 'Cruelty Free',
    image: 'https://vedicana.com/wp-content/uploads/cache/2024/08/Add-a-subheading-1-1/720556754.png',
    order_index: 3
  },
  {
    title: 'Chemical Free',
    image: 'https://vedicana.com/wp-content/uploads/cache/2024/08/Add-a-subheading-2/3896995376.png',
    order_index: 4
  },
  {
    title: 'Sustainable',
    image: 'https://vedicana.com/wp-content/uploads/2024/08/Add-a-subheading-1-2.png',
    order_index: 5
  },
  {
    title: 'SSL Secure',
    image: 'https://vedicana.com/wp-content/uploads/cache/2024/08/Add-a-subheading-4/86510149.png',
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
