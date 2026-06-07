const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        searchDir(filePath, pattern);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.json') || filePath.endsWith('.css')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          console.log(`Found pattern in ${filePath}`);
        }
      }
    }
  }
}

const searchPattern = process.argv[2] || 'invoice';
console.log(`Searching for: ${searchPattern}`);
searchDir(path.join(__dirname, '..', 'src'), searchPattern);
