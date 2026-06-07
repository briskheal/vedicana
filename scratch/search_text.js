import fs from 'fs';
import path from 'path';

const searchTerms = ['text-slate-350', 'text-slate-350'];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vscode' || file === 'BACKUPS_OLD') {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const term of searchTerms) {
          if (content.includes(term)) {
            console.log(`Found "${term}" in file: ${fullPath}`);
          }
        }
      } catch (err) {
      }
    }
  }
}

console.log('Searching...');
searchDir('d:\\MY WORK FLOW\\vedicana');
console.log('Search finished.');
