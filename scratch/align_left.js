import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '../scratch/discover_pages/discover-vedic-culture.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Find the image wrapper and replace the alignment
const targetString = 'wpb_single_image wpb_content_element vc_align_center wpb_content_element';
if (htmlContent.includes(targetString)) {
  console.log("Found center-aligned single image block inside HTML template. Modifying to left-aligned...");
  htmlContent = htmlContent.replace(
    targetString,
    'wpb_single_image wpb_content_element vc_align_left wpb_content_element'
  );
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log("[SUCCESS] Updated discover-vedic-culture.html template to left-aligned!");
} else {
  console.log("[WARNING] Could not find the centered image wrapper string inside the HTML file.");
}
