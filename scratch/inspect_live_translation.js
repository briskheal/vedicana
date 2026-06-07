import fs from 'fs';

function inspect() {
  const html = fs.readFileSync('scratch/live_raw.html', 'utf-8');
  const lines = html.split('\n');
  
  console.log("SURROUNDING CONTENT IN RAW HTML:");
  lines.forEach((line, index) => {
    if (line.includes('GoogleLanguageTranslatorInit') || line.includes('glt-') || line.includes('google_language_translator')) {
      console.log(`--- Line ${index + 1} ---`);
      console.log(line.trim().substring(0, 500));
    }
  });
}

inspect();
