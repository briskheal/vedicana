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

// Locate the Visual Composer single image element
const vcImageBlock = doc.querySelector('.wpb_single_image');
if (vcImageBlock) {
  console.log("Found Visual Composer image block.");
  
  // Extract the original image src and alt/title
  const imgEl = vcImageBlock.querySelector('img');
  if (imgEl) {
    const src = imgEl.getAttribute('src');
    const alt = imgEl.getAttribute('alt') || 'VediCana Herb Photo';
    
    console.log(`Original Src: ${src}`);
    console.log(`Original Alt: ${alt}`);
    
    // Create new standardized element
    const newDiv = doc.createElement('div');
    newDiv.className = 'img-wrap img-left';
    
    const newImg = doc.createElement('img');
    newImg.setAttribute('src', src);
    newImg.setAttribute('alt', alt);
    
    newDiv.appendChild(newImg);
    
    // Replace the legacy block with our clean block
    vcImageBlock.parentNode.replaceChild(newDiv, vcImageBlock);
    
    // Write the clean document back to the file
    fs.writeFileSync(htmlPath, doc.querySelector('.wpb-content-wrapper').innerHTML, 'utf8');
    console.log("[SUCCESS] Standardized image block to match Admin Discover Editor format!");
  } else {
    console.log("[ERROR] Image element not found inside the legacy block.");
  }
} else {
  console.log("[WARNING] Visual Composer image block not found in template. Checking if already standardized.");
}
