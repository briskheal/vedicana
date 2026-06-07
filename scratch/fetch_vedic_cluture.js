import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function test() {
  try {
    console.log('Fetching discover-vedic-cluture (live typo URL)...');
    const res = await fetch('https://vedicana.com/discover-vedic-cluture/');
    if (!res.ok) {
      console.log('Failed:', res.status);
      return;
    }
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Clean
    const elementsToRemove = doc.querySelectorAll('header, footer, nav, .header, .footer, .sidebar, script, style');
    elementsToRemove.forEach(el => el.remove());

    const contentContainer = doc.querySelector('.entry-content, article, .main-page-wrapper, main, #content');
    let contentHtml = '';
    if (contentContainer) {
      contentHtml = contentContainer.innerHTML.trim();
    } else {
      contentHtml = doc.body.innerHTML.trim();
    }

    const outputPath = path.join(__dirname, '../scratch/discover_pages/discover-vedic-culture.html');
    fs.writeFileSync(outputPath, contentHtml, 'utf8');
    console.log(`Saved clean HTML content to ${outputPath} (Length: ${contentHtml.length})`);
  } catch (err) {
    console.error(err);
  }
}
test();
