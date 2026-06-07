import fs from 'fs';
import path from 'path';

const searchTerms = ['VEDICANA', 'Vedicana'];
const matchingFiles = [];

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
        let matched = false;
        for (const term of searchTerms) {
          if (content.includes(term)) {
            matched = true;
          }
        }
        if (matched) {
          matchingFiles.push(fullPath);
        }
      } catch (err) {
      }
    }
  }
}

console.log('Searching for VEDICANA/Vedicana casing...');
searchDir('d:\\MY WORK FLOW\\vedicana');
console.log('Found in the following files:');
matchingFiles.forEach(f => console.log(f));
