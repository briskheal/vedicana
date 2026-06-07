import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '../scratch/discover_pages/discover-vedic-culture.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf8');

const dom = new JSDOM(rawHtml);
const doc = dom.window.document;

const img = doc.querySelector('img');
if (img) {
  let curr = img;
  let depth = 0;
  while (curr && curr.tagName !== 'BODY') {
    console.log(`[Level ${depth}] Tag: ${curr.tagName}, Class: ${curr.className}, Style: ${curr.getAttribute('style') || 'none'}`);
    curr = curr.parentElement;
    depth++;
  }
} else {
  console.log("No images found.");
}
