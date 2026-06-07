import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const ignorePatterns = [
  /vedicana-green/i,
  /vedicana-gold/i,
  /vedicana-teal/i,
  /vedicana-dark-green/i,
  /vedicana\.com/i,
  /vedicana_cart/i,
  /postgres/i,
  /VediCana/  // correct casing exactly
];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.js', '.jsx', '.json', '.html', '.css', '.md'].includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('vedicana')) {
      // Check if it's an incorrect casing
      const hasCorrect = line.includes('VediCana');
      // If it contains "vedicana" but doesn't have the exact correct casing, or has other forms
      // Let's see if it matches any ignore patterns
      let isIgnored = false;
      for (const pattern of ignorePatterns) {
        if (pattern.test(line)) {
          // If it matches VediCana exactly, or matches classes/URLs
          isIgnored = true;
          break;
        }
      }
      
      // Additional check: if it contains "Vedicana" or "VEDICANA" or "vedicana" not matching ignore patterns
      if (!isIgnored) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`[INCORRECT] ${relativePath}:${idx + 1} -> ${line.trim()}`);
      }
    }
  });
}

console.log('Scanning project files for spelling/casing issues...');
scanDir(path.join(projectRoot, 'src'));
console.log('Scan complete.');
