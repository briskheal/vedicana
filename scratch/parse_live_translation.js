import fs from 'fs';

function run() {
  const filePath = 'C:/Users/J S DASH/.gemini/antigravity/brain/39249ead-7316-4fbe-b96b-f310e201354a/.system_generated/steps/8424/content.md';
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist!");
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  console.log("MATCHING LINES:");
  lines.forEach((line, index) => {
    if (
      line.includes('translate') || 
      line.includes('gtranslate') || 
      line.includes('googtrans') || 
      line.includes('google-translate') ||
      line.includes('class="gt_') ||
      line.includes('.js')
    ) {
      if (line.length < 300) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      } else {
        console.log(`Line ${index + 1}: ${line.trim().substring(0, 300)}... (truncated)`);
      }
    }
  });
}

run();
