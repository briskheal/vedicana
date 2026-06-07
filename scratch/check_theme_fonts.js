async function analyzeThemeCSS() {
  try {
    console.log('Fetching homepage HTML...');
    const response = await fetch('https://vedicana.com');
    const html = await response.text();

    const stylesheetRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
    const urls = [];
    let match;
    while ((match = stylesheetRegex.exec(html)) !== null) {
      urls.push(match[1]);
    }

    // Filter urls that have 'xstore' or 'theme' in their name
    const themeUrls = urls.filter(url => url.toLowerCase().includes('xstore') || url.toLowerCase().includes('theme') || url.toLowerCase().includes('style.css'));
    console.log(`Found ${themeUrls.length} theme/xstore stylesheets out of ${urls.length} total.`);

    const fontFamilies = [];
    for (let url of themeUrls) {
      if (url.startsWith('//')) {
        url = 'https:' + url;
      }
      try {
        console.log(`Analyzing: ${url.substring(0, 100)}...`);
        const res = await fetch(url);
        if (!res.ok) continue;
        const cssText = await res.text();

        const ffRegex = /font-family\s*:\s*([^;!{}]+)/gi;
        let ffMatch;
        while ((ffMatch = ffRegex.exec(cssText)) !== null) {
          const fontVal = ffMatch[1].replace(/['"']/g, '').trim();
          if (fontVal && !fontFamilies.includes(fontVal)) {
            fontFamilies.push(fontVal);
          }
        }
      } catch (e) {
        console.log('Failed to fetch:', url);
      }
    }

    console.log('\n--- DETECTED BRAND THEME FONTS ---');
    console.log(fontFamilies.filter(f => !f.includes('-apple-system') && !f.includes('inherit') && !f.includes('Arial') && !f.includes('sans-serif') && !f.includes('Font Awesome') && !f.includes('dashicons')));

  } catch (err) {
    console.error('Error analyzing CSS:', err);
  }
}

analyzeThemeCSS();
