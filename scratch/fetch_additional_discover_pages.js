import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const additionalPages = [
  { name: 'spiritual-home-omvedic', url: 'https://vedicana.com/spritual-home-omvedic/' },
  { name: 'ziva-vedicana', url: 'https://vedicana.com/ziva-vedicana/' }
];

async function fetchPageContent(page) {
  try {
    console.log(`Fetching ${page.name} from ${page.url}...`);
    const res = await fetch(page.url);
    if (!res.ok) {
      console.log(`Failed to fetch ${page.name}: status ${res.status}`);
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

    const outputPath = path.join(__dirname, `../scratch/discover_pages/${page.name}.html`);
    fs.writeFileSync(outputPath, contentHtml, 'utf8');
    console.log(`  Saved clean HTML content to ${outputPath} (Length: ${contentHtml.length})`);
  } catch (err) {
    console.error(`Error processing ${page.name}:`, err);
  }
}

async function run() {
  for (const page of additionalPages) {
    await fetchPageContent(page);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('Additional pages processed!');
}

run();
