import fs from 'fs';
const contentPath = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/.system_generated/steps/2191/content.md';
const lines = fs.readFileSync(contentPath, 'utf8').split('\n');

for (let i = 1834; i <= 1857; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
