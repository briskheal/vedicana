import fs from 'fs';

function findPluginScripts() {
  const html = fs.readFileSync('scratch/live_raw.html', 'utf-8');
  
  // Use regex to find all <script> tags with src
  const scriptRegex = /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  let count = 0;
  
  console.log("MATCHING EXTERNAL SCRIPTS:");
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes('google-language-translator') || src.includes('gtranslate')) {
      count++;
      console.log(`--- Script ${count} ---`);
      console.log(src);
    }
  }
}

findPluginScripts();
