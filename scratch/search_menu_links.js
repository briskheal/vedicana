import { JSDOM } from 'jsdom';

async function test() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    console.log('--- SCANNING DISCOVER MENU LINKS ON LIVE SITE ---');
    const links = doc.querySelectorAll('a');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent.trim();
      if (href.includes('discover') || href.includes('about') || href.includes('ingredients') || href.includes('philanthropy') || href.includes('team')) {
        console.log(`Link: text="${text}", href="${href}"`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
test();
