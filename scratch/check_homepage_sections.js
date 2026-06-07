import { JSDOM } from 'jsdom';

async function test() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    console.log('--- HOMEPAGE SECTIONS RESEARCH ---');

    // 1. Check title/meta
    console.log(`Title: ${doc.title}`);

    // 2. Check header or main navigation elements
    const navigation = doc.querySelectorAll('.menu-item, [class*="menu-item"]');
    console.log(`Found ${navigation.length} menu items.`);
    
    // 3. Find other banners (banners that are NOT in the slider, e.g. promo banners below the slider)
    const promoBanners = doc.querySelectorAll('.promo-banner, [class*="banner"]');
    console.log(`Found ${promoBanners.length} promo banner elements.`);
    promoBanners.forEach((banner, idx) => {
      const img = banner.querySelector('img');
      const src = img ? (img.getAttribute('src') || img.getAttribute('data-lazyload') || img.getAttribute('data-src') || '') : '';
      const text = banner.textContent.replace(/\s+/g, ' ').trim();
      console.log(`Promo Banner [${idx}]: img=${src}, text="${text.substring(0, 150)}"`);
    });

    // 4. Find section titles (like h1, h2, h3)
    const headings = doc.querySelectorAll('h1, h2, h3, h4');
    console.log(`Found ${headings.length} headings.`);
    headings.forEach((h, idx) => {
      console.log(`Heading [${idx}]: tag=${h.tagName}, text="${h.textContent.trim()}"`);
    });

    // 5. Look for products listed on homepage
    const prods = doc.querySelectorAll('.product, [class*="product-grid"], [class*="product-item"]');
    console.log(`Found ${prods.length} product elements on homepage.`);

  } catch (err) {
    console.error(err);
  }
}
test();
