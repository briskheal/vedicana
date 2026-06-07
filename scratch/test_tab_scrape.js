import { JSDOM } from 'jsdom';

async function test() {
  const url = 'https://vedicana.com/product/nuix-pain-relief-roll-on/';
  console.log(`Fetching ${url}...`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Extract Specification
    const specEl = doc.querySelector('#tab-single_custom_tab_01');
    const specHtml = specEl ? specEl.innerHTML.trim() : 'Not Found';
    console.log('\n--- SPECIFICATION ---');
    console.log(specHtml);
    
    // Extract Additional Information
    const addInfoEl = doc.querySelector('#tab-additional_information');
    const attributes = {};
    if (addInfoEl) {
      const rows = addInfoEl.querySelectorAll('tr');
      rows.forEach(row => {
        const labelEl = row.querySelector('th');
        const valueEl = row.querySelector('td');
        if (labelEl && valueEl) {
          attributes[labelEl.textContent.trim()] = valueEl.textContent.trim();
        }
      });
    }
    console.log('\n--- ADDITIONAL INFORMATION ---');
    console.log(JSON.stringify(attributes, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
