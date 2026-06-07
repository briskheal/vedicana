import fs from 'fs';

const contentPath = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/.system_generated/steps/2191/content.md';
const content = fs.readFileSync(contentPath, 'utf8');

const terms = ['commendation', 'message', 'founder', 'director', 'chairman', 'recogni', 'award'];
const lines = content.split('\n');

console.log('Searching for commendation/message related terms in content.md...');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const term of terms) {
    if (line.toLowerCase().includes(term.toLowerCase())) {
      console.log(`Line ${i + 1} (${term}): ${line.substring(0, 150)}...`);
    }
  }
}
console.log('Search finished.');
