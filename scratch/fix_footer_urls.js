import { config } from 'dotenv';
config();
import FooterLink from '../src/models/FooterLink.js';

const fixFooterUrls = async () => {
  try {
    // Fix Cancelation Policy
    await FooterLink.update(
      { url: '/cancelation-policy' },
      { where: { title: 'Cancelation Policy' } }
    );
    
    // Fix Returns & Refund Policy
    await FooterLink.update(
      { url: '/return-policy' },
      { where: { title: 'Returns & Refund Policy' } }
    );

    // Fix Terms and Conditions
    await FooterLink.update(
      { url: '/terms-and-conditions' },
      { where: { title: 'Terms and Conditions' } }
    );

    console.log('Successfully updated footer links to match page slugs!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating footer links:', err);
    process.exit(1);
  }
};

fixFooterUrls();
