import { config } from 'dotenv';
config();
import FooterLink from './src/models/FooterLink.js';

const seed = async () => {
  const links = [
    { title: 'Payment Security', url: '/payment-security', section: 'policies', order_index: 1 },
    { title: 'Pricing Policy', url: '/pricing-policy', section: 'policies', order_index: 2 },
    { title: 'Cancelation Policy', url: '/cancelation-policy', section: 'policies', order_index: 3 },
    { title: 'Shipping Policy', url: '/shipping-policy', section: 'policies', order_index: 4 },
    { title: 'Returns & Refund Policy', url: '/return-policy', section: 'policies', order_index: 5 },
    { title: 'Privacy Policy', url: '/privacy-policy', section: 'policies', order_index: 6 },
    { title: 'Terms and Conditions', url: '/terms-and-conditions', section: 'policies', order_index: 7 },
  ];

  try {
    for (const link of links) {
      await FooterLink.findOrCreate({
        where: { title: link.title, section: link.section },
        defaults: link
      });
    }
    console.log('Footer links seeded!');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
};

seed();
