async function scanKirkiStyles() {
  try {
    const url = 'https://vedicana.com/wp-content/uploads/xstore/kirki-styles.css';
    console.log('Fetching Kirki customizer CSS...');
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch customizer stylesheet (Status: ${res.status})`);
    }
    const cssText = await res.text();

    console.log('\n--- FINDING ALL font-family RULES IN CUSTOMIZER STYLESHEET ---');
    const rules = [];
    // We want to capture selectors and the font-family rule inside them
    // E.g. .selector { ... font-family: ... }
    // Let's search for matches of font-family and print their context
    const lines = cssText.split('\n');
    const matches = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('font-family')) {
        matches.push({ lineNum: i + 1, content: line.trim() });
      }
    }

    console.log(`Found ${matches.length} font-family occurrences:`);
    matches.forEach(m => console.log(`Line ${m.lineNum}: ${m.content}`));

  } catch (err) {
    console.error('Error:', err);
  }
}

scanKirkiStyles();
