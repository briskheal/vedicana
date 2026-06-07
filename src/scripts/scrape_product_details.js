import 'dotenv/config';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';

import Product from '../models/Product.js';

// Parse command line arguments
const args = process.argv.slice(2);
let offset = 0;
let limit = 10;

args.forEach(arg => {
  if (arg.startsWith('--offset=')) {
    offset = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--limit=')) {
    limit = parseInt(arg.split('=')[1], 10);
  }
});

async function fetchImageAsWebpBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const webpBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
      
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`  [ERROR] Processing image ${imageUrl}:`, error.message);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`[Chunk Scraper] Starting chunk: offset=${offset}, limit=${limit}`);
  
  try {
    console.log("[Chunk Scraper] Fetching products list from WooCommerce API...");
    const res = await fetch('https://vedicana.com/wp-json/wc/store/products?per_page=100');
    if (!res.ok) {
      throw new Error(`WooCommerce API returned status ${res.status}`);
    }
    const wcProducts = await res.json();
    console.log(`[Chunk Scraper] Total products available: ${wcProducts.length}`);

    // Slice the products list
    const chunkProducts = wcProducts.slice(offset, offset + limit);
    console.log(`[Chunk Scraper] Processing chunk slice of ${chunkProducts.length} products...`);

    for (let i = 0; i < chunkProducts.length; i++) {
      const wcProd = chunkProducts[i];
      const indexInChunk = offset + i;
      console.log(`\n[${indexInChunk + 1}/${wcProducts.length}] Processing product: "${wcProd.name}" (${wcProd.slug})`);

      // Find product in local DB
      const dbProduct = await Product.findOne({
        where: { slug: wcProd.slug }
      });

      if (!dbProduct) {
        console.log(`  [WARNING] Product with slug "${wcProd.slug}" not found in local database. Skipping.`);
        continue;
      }

      // 1. Process main image
      let mainImageBase64 = dbProduct.image;
      if (wcProd.images && wcProd.images.length > 0) {
        console.log(`  Fetching main image: ${wcProd.images[0].src}`);
        const mainImg = await fetchImageAsWebpBase64(wcProd.images[0].src);
        if (mainImg) {
          mainImageBase64 = mainImg;
        }
      }

      // 2. Process gallery images (all images in the list)
      const galleryBase64Array = [];
      if (wcProd.images && wcProd.images.length > 0) {
        console.log(`  Found ${wcProd.images.length} images. Processing gallery...`);
        for (let imgIdx = 0; imgIdx < wcProd.images.length; imgIdx++) {
          const imgObj = wcProd.images[imgIdx];
          console.log(`  - Fetching gallery image [${imgIdx + 1}/${wcProd.images.length}]: ${imgObj.src}`);
          const galleryImg = await fetchImageAsWebpBase64(imgObj.src);
          if (galleryImg) {
            galleryBase64Array.push(galleryImg);
          }
          // Brief sleep to avoid hitting server too hard
          await sleep(200);
        }
      }

      // 3. Fetch product page HTML for Tab Scraping (Specification & Additional Info)
      let parsedSpecification = '';
      let parsedAdditionalInfo = null;

      try {
        const pageUrl = `https://vedicana.com/product/${wcProd.slug}/`;
        console.log(`  Fetching live page for tab parsing: ${pageUrl}`);
        const htmlRes = await fetch(pageUrl);
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          const dom = new JSDOM(html);
          const doc = dom.window.document;

          // 3a. Extract Specification (#tab-single_custom_tab_01)
          const specEl = doc.querySelector('#tab-single_custom_tab_01');
          if (specEl) {
            parsedSpecification = specEl.innerHTML.trim();
            console.log('  - Extracted specifications HTML.');
          }

          // 3b. Extract Additional Info (#tab-additional_information)
          const addInfoEl = doc.querySelector('#tab-additional_information');
          if (addInfoEl) {
            const attributes = {};
            const rows = addInfoEl.querySelectorAll('tr');
            rows.forEach(row => {
              const labelEl = row.querySelector('th');
              const valueEl = row.querySelector('td');
              if (labelEl && valueEl) {
                attributes[labelEl.textContent.trim()] = valueEl.textContent.trim();
              }
            });
            parsedAdditionalInfo = attributes;
            console.log(`  - Extracted additional attributes: ${JSON.stringify(attributes)}`);
          }
        } else {
          console.log(`  [WARNING] Could not fetch live HTML (status: ${htmlRes.status}). Skipping tabs.`);
        }
      } catch (tabErr) {
        console.error('  [ERROR] Scraping product page HTML tabs:', tabErr.message);
      }

      // 4. Enrich description (combine short and detailed description)
      let richDescription = '';
      if (wcProd.short_description) {
        richDescription += `<div class="short-description mb-3.5">${wcProd.short_description}</div>`;
      }
      if (wcProd.description) {
        richDescription += `<div class="detailed-description mt-3.5 border-t border-gray-100 pt-3.5">
          <h3 class="text-xl font-serif text-vedicana-dark-green mb-3">Product Details & Benefits</h3>
          ${wcProd.description}
        </div>`;
      }

      // If both are empty, use fallback from DB
      if (!richDescription) {
        richDescription = dbProduct.description;
      }

      // 5. Update the DB product
      await Product.update({
        image: mainImageBase64,
        gallery: galleryBase64Array,
        description: richDescription,
        specification: parsedSpecification || null,
        additional_info: parsedAdditionalInfo || null,
        price: parseFloat(wcProd.prices.regular_price) / (10 ** wcProd.prices.currency_minor_unit || 100),
        sale_price: parseFloat(wcProd.prices.sale_price) / (10 ** wcProd.prices.currency_minor_unit || 100),
      }, {
        where: { id: dbProduct.id }
      });

      console.log(`  [SUCCESS] Updated database for "${wcProd.name}"`);
      await sleep(500); // Politeness delay between products
    }

    console.log(`\n[Chunk Scraper] Successfully processed chunk: offset=${offset}, limit=${limit}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Chunk Scraper] ERROR in chunk run:`, error);
    process.exit(1);
  }
}

run();
