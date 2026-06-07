import fs from 'fs';
import path from 'path';

const targetDir = 'd:\\MY WORK FLOW\\vedicana\\scratch\\discover_pages';
const files = fs.readdirSync(targetDir);

for (const file of files) {
  if (file.endsWith('.html')) {
    const fullPath = path.join(targetDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace Vedicana with VediCana
    // We replace 'Vedicana' with 'VediCana'
    // To preserve other casings if any, we can do selective replacements:
    let updated = content;
    updated = updated.replace(/Vedicana/g, 'VediCana');
    updated = updated.replace(/vedicana/g, 'VediCana'); // user-facing text
    
    // Write back if changed
    if (updated !== content) {
      fs.writeFileSync(fullPath, updated);
      console.log(`Updated casing in HTML file: ${file}`);
    }
  }
}

console.log('Spelling corrections in scratch files completed.');
