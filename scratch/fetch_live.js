import https from 'https';
import fs from 'fs';

function fetchLive() {
  const url = 'https://vedicana.com/';
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      fs.writeFileSync('scratch/live_raw.html', data);
      console.log("SUCCESSFULLY SAVED RAW HTML. Size:", data.length);
      
      const lines = data.split('\n');
      console.log("MATCHING LINES IN RAW HTML:");
      lines.forEach((line, index) => {
        if (
          line.includes('translate') || 
          line.includes('gtranslate') || 
          line.includes('googtrans') || 
          line.includes('googleTranslate') ||
          line.includes('gt_')
        ) {
          if (line.length < 300) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
          } else {
            console.log(`Line ${index + 1}: ${line.trim().substring(0, 300)}... (truncated)`);
          }
        }
      });
    });
  }).on('error', (e) => {
    console.error("Fetch error:", e);
  });
}

fetchLive();
