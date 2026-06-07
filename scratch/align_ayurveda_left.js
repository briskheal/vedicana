import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '../scratch/discover_pages/discover-ayurveda.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace all occurrences of "img-wrap img-center" with "img-wrap img-left"
const target = 'img-wrap img-center';
const replacement = 'img-wrap img-left';

if (htmlContent.includes(target)) {
  console.log("Found centered images in discover-ayurveda template. Aligning them left...");
  htmlContent = htmlContent.replaceAll(target, replacement);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log("[SUCCESS] Updated discover-ayurveda.html to use left-aligned images!");
} else {
  console.log("[WARNING] Could not find 'img-wrap img-center' inside the discover-ayurveda HTML file.");
}
