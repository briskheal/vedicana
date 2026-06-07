import 'dotenv/config';
import models, { sequelize } from '../src/models/index.js';
import { Op } from 'sequelize';

const searchTerms = ['Sweden', 'Ziva', 'Fridensborgsvägen', 'info@zivainnovations.se'];

async function searchDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Search DiscoverPage
    console.log('\nSearching DiscoverPages...');
    const pages = await models.DiscoverPage.findAll();
    for (const page of pages) {
      for (const term of searchTerms) {
        if (page.content?.toLowerCase().includes(term.toLowerCase()) || 
            page.title?.toLowerCase().includes(term.toLowerCase())) {
          console.log(`Found "${term}" in DiscoverPage (ID: ${page.id}, Title: ${page.title}, Slug: ${page.slug})`);
        }
      }
    }

    // Search FooterLink
    console.log('\nSearching FooterLinks...');
    const links = await models.FooterLink.findAll();
    for (const link of links) {
      for (const term of searchTerms) {
        if (link.title?.toLowerCase().includes(term.toLowerCase()) || 
            link.url?.toLowerCase().includes(term.toLowerCase())) {
          console.log(`Found "${term}" in FooterLink (ID: ${link.id}, Title: ${link.title}, URL: ${link.url})`);
        }
      }
    }

    // Search Products
    console.log('\nSearching Products...');
    const products = await models.Product.findAll();
    for (const prod of products) {
      for (const term of searchTerms) {
        if (prod.name?.toLowerCase().includes(term.toLowerCase()) || 
            prod.description?.toLowerCase().includes(term.toLowerCase())) {
          console.log(`Found "${term}" in Product (ID: ${prod.id}, Name: ${prod.name})`);
        }
      }
    }

    console.log('\nSearch completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database search:', error);
    process.exit(1);
  }
}

searchDB();
