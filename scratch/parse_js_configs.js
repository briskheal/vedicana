import fs from 'fs';

function findScripts() {
  const html = fs.readFileSync('scratch/live_raw.html', 'utf-8');
  
  // Use regex to find all <script> blocks
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  
  console.log("MATCHING SCRIPT BLOCKS:");
  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1];
    if (scriptContent.includes('GoogleLanguageTranslatorInit') || scriptContent.includes('google_language_translator') || scriptContent.includes('doGTranslate')) {
      count++;
      console.log(`--- Script Block ${count} ---`);
      console.log(scriptContent.trim());
    }
  }
}

findScripts();
