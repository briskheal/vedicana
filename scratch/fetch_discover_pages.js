import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  { name: 'about', url: 'https://vedicana.com/about/' },
  { name: 'discover-ayurveda', url: 'https://vedicana.com/discover-ayurveda/' },
  { name: 'discover-vedic-culture', url: 'https://vedicana.com/discover-vedic-culture/' },
  { name: 'our-ingredients', url: 'https://vedicana.com/our-ingredients/' },
  { name: 'csr-and-philanthropy', url: 'https://vedicana.com/csr-and-philanthropy/' },
  { name: 'our-team', url: 'https://vedicana.com/our-team/' }
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

    // Remove headers, footers, sidebars, navigation to get core content
    const elementsToRemove = doc.querySelectorAll('header, footer, nav, .header, .footer, .sidebar, script, style');
    elementsToRemove.forEach(el => el.remove());

    // Try to find the primary content container
    // WooCommerce / Woodmart uses .main-page-wrapper, .entry-content, article, or similar
    const contentContainer = doc.querySelector('.entry-content, article, .main-page-wrapper, main, #content');
    let contentHtml = '';
    if (contentContainer) {
      contentHtml = contentContainer.innerHTML.trim();
    } else {
      contentHtml = doc.body.innerHTML.trim();
    }

    const outputDir = path.join(__dirname, '../scratch/discover_pages');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${page.name}.html`);
    fs.writeFileSync(outputPath, contentHtml, 'utf8');
    console.log(`  Saved parsed HTML to ${outputPath} (Length: ${contentHtml.length})`);
  } catch (err) {
    console.error(`Error processing ${page.name}:`, err);
  }
}

async function run() {
  for (const page of pages) {
    await fetchPageContent(page);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log('All Discover pages processed!');
}

run();
