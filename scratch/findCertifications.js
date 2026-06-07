import { JSDOM } from 'jsdom';

async function run() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Find all images
    const imgs = doc.querySelectorAll('img');
    const allImgs = [];

    imgs.forEach(img => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      allImgs.push({ src, alt });
    });

    console.log('Total images found:', allImgs.length);
    // Filter for uploads images
    const uploads = allImgs.filter(i => i.src.includes('/uploads/'));
    console.log('Uploads images:', JSON.stringify(uploads, null, 2));

  } catch (e) {
    console.error('Error:', e);
  }
}

run();
