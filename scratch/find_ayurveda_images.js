import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '../scratch/discover_pages/discover-ayurveda.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

const images = doc.querySelectorAll('img');
console.log(`Found ${images.length} images inside discover-ayurveda.html:`);

images.forEach((img, i) => {
  let curr = img;
  let ancestors = [];
  while (curr && curr.tagName !== 'BODY') {
    ancestors.push(`${curr.tagName}(${curr.className || ''})`);
    curr = curr.parentElement;
  }
  console.log(`\nImage ${i + 1}:`);
  console.log(`- Src: ${img.src}`);
  console.log(`- Ancestry: ${ancestors.slice(0, 5).join(' -> ')}`);
});
