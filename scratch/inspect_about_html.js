import fs from 'fs';
import path from 'path';

const content = fs.readFileSync('d:\\MY WORK FLOW\\vedicana\\scratch\\discover_pages\\about.html', 'utf8');
const searchStr = 'Sweden';
let index = -1;

while ((index = content.indexOf(searchStr, index + 1)) !== -1) {
  console.log(`--- Match at index ${index} ---`);
  console.log(content.substring(Math.max(0, index - 150), Math.min(content.length, index + 150)));
}
