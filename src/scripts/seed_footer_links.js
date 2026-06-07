import 'dotenv/config';
import models, { sequelize } from '../models/index.js';

const { FooterLink } = models;

const initialLinks = [
  // Quick Links
  { title: 'My Account', url: '/profile', section: 'quick_links', order_index: 0 },
  { title: 'Cart', url: '/cart', section: 'quick_links', order_index: 1 },
  { title: 'Checkout', url: '/checkout', section: 'quick_links', order_index: 2 },
  { title: 'Wishlist', url: '/shop', section: 'quick_links', order_index: 3 },
  { title: 'About', url: '/about', section: 'quick_links', order_index: 4 },
  { title: 'Contact Us', url: '/contact', section: 'quick_links', order_index: 5 },

  // Policies
  { title: 'Payment Option', url: '/payment-option', section: 'policies', order_index: 0 },
  { title: 'Payment Security', url: '/payment-security', section: 'policies', order_index: 1 },
  { title: 'Pricing Policy', url: '/pricing-policy', section: 'policies', order_index: 2 },
  { title: 'Cancelation Policy', url: '/cancellation-policy', section: 'policies', order_index: 3 },
  { title: 'Shipping Policy', url: '/shipping-policy', section: 'policies', order_index: 4 },
  { title: 'Returns & Refund Policy', url: '/refund-policy', section: 'policies', order_index: 5 },
  { title: 'Privacy Policy', url: '/privacy-policy', section: 'policies', order_index: 6 },
  { title: 'Terms and Conditions', url: '/terms-conditions', section: 'policies', order_index: 7 },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL to seed footer links.');

    // Count existing footer links
    const count = await FooterLink.count();
    if (count > 0) {
      console.log('Footer links already exist. Skipping seed to prevent duplicates.');
      process.exit(0);
    }

    console.log('Seeding initial footer links...');
    await FooterLink.bulkCreate(initialLinks);
    console.log('Seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding footer links:', error);
    process.exit(1);
  }
}

seed();
