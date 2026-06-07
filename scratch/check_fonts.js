async function checkFonts() {
  try {
    console.log('Fetching vedicana.com homepage to inspect fonts...');
    const response = await fetch('https://vedicana.com');
    const html = await response.text();

    console.log('\n--- SEARCHING FOR GOOGLE FONTS LINK ---');
    const fontLinks = html.match(/<link[^>]*fonts\.googleapis[^>]*>/gi) || [];
    fontLinks.forEach(link => console.log('Found:', link));

    console.log('\n--- SEARCHING FOR INLINE STYLE FONTS ---');
    const fontFamilies = [];
    const regex = /font-family\s*:\s*([^;'}"]+)/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      fontFamilies.push(match[1].trim());
    }
    const uniqueFonts = [...new Set(fontFamilies)];
    console.log('Unique Font Families in HTML:', uniqueFonts.slice(0, 15));

    console.log('\n--- SEARCHING FOR WEBFONTS OR STYLESHEETS ---');
    const styleLinks = html.match(/<link[^>]*href=[^>]*\.css[^>]*>/gi) || [];
    console.log(`Found ${styleLinks.length} CSS stylesheets.`);
    
    // Look for typical Google Fonts or Custom font declarations in the text
    const searchTerms = ['Montserrat', 'Jost', 'Poppins', 'Cinzel', 'Playfair', 'Cormorant', 'Inter', 'Cardo', 'Quicksand', 'Mulish', 'Marcellus', 'Tenor Sans', 'Manrope', 'Lust', 'Didot', 'Bodoni', 'Garamond', 'Jost'];
    console.log('\n--- SCANNING HTML FOR KNOWN FONTS ---');
    searchTerms.forEach(term => {
      const occurrences = (html.match(new RegExp(term, 'gi')) || []).length;
      if (occurrences > 0) {
        console.log(`- Font "${term}" found ${occurrences} times.`);
      }
    });

  } catch (err) {
    console.error('Error fetching website:', err);
  }
}

checkFonts();
