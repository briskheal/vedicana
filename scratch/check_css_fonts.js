async function analyzeCSS() {
  try {
    console.log('Fetching vedicana.com homepage...');
    const response = await fetch('https://vedicana.com');
    const html = await response.text();

    console.log('Parsing CSS stylesheet links...');
    const stylesheetRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
    const urls = [];
    let match;
    while ((match = stylesheetRegex.exec(html)) !== null) {
      urls.push(match[1]);
    }

    console.log(`Found ${urls.length} CSS stylesheets.`);
    
    // We will scan the first 10 stylesheets for font declarations
    const fontFamilies = [];
    const fontFaces = [];
    
    for (let i = 0; i < Math.min(urls.length, 15); i++) {
      let url = urls[i];
      if (url.startsWith('//')) {
        url = 'https:' + url;
      }
      try {
        console.log(`Fetching CSS: ${url.substring(0, 80)}...`);
        const cssRes = await fetch(url);
        if (!cssRes.ok) continue;
        const cssText = await cssRes.text();
        
        // Scan for font-family
        const ffRegex = /font-family\s*:\s*([^;!{}]+)/gi;
        let ffMatch;
        while ((ffMatch = ffRegex.exec(cssText)) !== null) {
          const fontVal = ffMatch[1].replace(/['"']/g, '').trim();
          if (fontVal && !fontFamilies.includes(fontVal)) {
            fontFamilies.push(fontVal);
          }
        }

        // Scan for @font-face
        const faceRegex = /@font-face\s*{([^}]+)}/gi;
        let faceMatch;
        while ((faceMatch = faceRegex.exec(cssText)) !== null) {
          const faceText = faceMatch[1];
          const familyMatch = /font-family\s*:\s*([^;'}"]+)/i.exec(faceText);
          if (familyMatch) {
            const name = familyMatch[1].replace(/['"]/g, '').trim();
            if (!fontFaces.includes(name)) {
              fontFaces.push(name);
            }
          }
        }
      } catch (err) {
        console.log(`Failed to fetch: ${url}`);
      }
    }

    console.log('\n--- DETECTED FONT FAMILIES IN CSS ---');
    console.log(fontFamilies.slice(0, 30));

    console.log('\n--- DETECTED @FONT-FACE FONTS ---');
    console.log(fontFaces);

  } catch (err) {
    console.error('Error analyzing CSS:', err);
  }
}

analyzeCSS();
