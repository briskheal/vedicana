import { JSDOM } from 'jsdom';

async function test() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    console.log('--- ALL MENU LINKS ON LIVE SITE ---');
    
    // Find all menu links in header
    // Woodmart uses .wd-nav or .menu-item
    const navLinks = doc.querySelectorAll('.wd-nav a, .main-navigation a, .menu-item a, nav a');
    console.log(`Found ${navLinks.length} raw nav link matches.`);
    
    const uniqueLinks = new Map();
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent.trim().replace(/\s+/g, ' ');
      if (href && !href.startsWith('#') && !uniqueLinks.has(href)) {
        uniqueLinks.set(href, text);
      }
    });

    uniqueLinks.forEach((text, href) => {
      console.log(`Nav Link: [${text}] -> ${href}`);
    });

  } catch (err) {
    console.error(err);
  }
}
test();
