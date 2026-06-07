const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const pattern = process.argv[3];

if (!filePath || !pattern) {
  console.log("Usage: node show_lines.cjs <filePath> <pattern>");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
if (!fs.existsSync(absolutePath)) {
  console.error("File does not exist:", absolutePath);
  process.exit(1);
}

const content = fs.readFileSync(absolutePath, 'utf-8');
const lines = content.split('\n');
console.log(`Searching for "${pattern}" in ${filePath}:`);
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes(pattern.toLowerCase())) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
