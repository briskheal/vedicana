import fs from 'fs';
import path from 'path';

function searchDir(dir, searchStr) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        searchDir(fullPath, searchStr);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.mjs')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(searchStr)) {
          console.log(`Found "${searchStr}" in file: ${fullPath}`);
        }
      }
    }
  }
}

console.log('Searching for "seed" calls in src/ folder:');
searchDir('src', 'seed');
console.log('\nSearching for "seed_discover_pages" in src/ folder:');
searchDir('src', 'seed_discover_pages');
