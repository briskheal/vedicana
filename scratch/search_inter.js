import fs from 'fs';
import path from 'path';

const searchDir = './src';

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Inter') || content.includes('inter')) {
        // Ignore case check in some standard CSS properties but search for the font name
        if (content.includes("'Inter'") || content.includes('"Inter"') || content.includes('Inter,') || content.includes('family=Inter')) {
          console.log(`Found reference in: ${fullPath}`);
        }
      }
    }
  });
}

scanDir(searchDir);
