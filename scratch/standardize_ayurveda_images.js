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

// Locate all Visual Composer single image elements
const vcImageBlocks = doc.querySelectorAll('.wpb_single_image');
console.log(`Found ${vcImageBlocks.length} Visual Composer image blocks.`);

vcImageBlocks.forEach((vcImageBlock, index) => {
  const imgEl = vcImageBlock.querySelector('img');
  if (imgEl) {
    const src = imgEl.getAttribute('src');
    const alt = imgEl.getAttribute('alt') || 'VediCana Herb Photo';
    
    // Create new standardized element
    const newDiv = doc.createElement('div');
    newDiv.className = 'img-wrap img-center';
    
    const newImg = doc.createElement('img');
    newImg.setAttribute('src', src);
    newImg.setAttribute('alt', alt);
    
    newDiv.appendChild(newImg);
    
    // Replace the legacy block with our clean block
    vcImageBlock.parentNode.replaceChild(newDiv, vcImageBlock);
    console.log(`Standardized Image ${index + 1}: ${src}`);
  }
});

if (vcImageBlocks.length > 0) {
  // Write the clean document back to the file
  fs.writeFileSync(htmlPath, doc.querySelector('.wpb-content-wrapper').innerHTML, 'utf8');
  console.log("[SUCCESS] Standardized all discover-ayurveda.html image blocks!");
} else {
  console.log("No legacy image blocks found to standardize.");
}
