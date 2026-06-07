import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const pages = [
  'about',
  'discover-ayurveda',
  'discover-vedic-culture',
  'spiritual-home-omvedic',
  'our-ingredients',
  'csr-and-philanthropy',
  'our-team'
];

function cleanHtml(html, pageTitle = '') {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const body = doc.body;
  const resultElements = [];

  function traverse(node) {
    if (!node) return;
    if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase();
      const className = typeof node.className === 'string' ? node.className : '';

      // Skip elements that are breadcrumbs or title headers from the scraped layout
      if (className.includes('breadcrumbs') || className.includes('page-heading') || className.includes('back-history')) {
        return; // Skip these and their children
      }

      if (className.includes('img-wrap') || tagName === 'img') {
        let imgWrap;
        if (tagName === 'img') {
          imgWrap = doc.createElement('div');
          imgWrap.className = 'img-wrap img-center';
          const clonedImg = node.cloneNode(true);
          imgWrap.appendChild(clonedImg);
        } else {
          imgWrap = node.cloneNode(true);
        }
        
        const img = imgWrap.querySelector('img');
        if (img) {
          const lazySrc = img.getAttribute('data-lazy-src');
          if (lazySrc) {
            img.setAttribute('src', lazySrc);
            img.removeAttribute('data-lazy-src');
          }
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.removeAttribute('class');
        }

        const captionSpan = imgWrap.querySelector('.caption') || imgWrap.querySelector('span');
        if (captionSpan) {
          const cleanSpan = doc.createElement('span');
          cleanSpan.className = 'caption';
          cleanSpan.textContent = captionSpan.textContent.trim();
          if (img.nextSibling) {
            imgWrap.insertBefore(cleanSpan, img.nextSibling);
          } else {
            imgWrap.appendChild(cleanSpan);
          }
        }

        let align = 'center';
        if (className.includes('img-left') || className.includes('vc_align_left')) {
          align = 'left';
        } else if (className.includes('img-right') || className.includes('vc_align_right')) {
          align = 'right';
        }
        imgWrap.className = `img-wrap img-${align}`;
        resultElements.push(imgWrap.outerHTML);
        return;
      }

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote', 'table'].includes(tagName)) {
        // Skip duplicate title headings
        const text = node.textContent.trim();
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normText = normalize(text);
        const normTitle = normalize(pageTitle);
        
        // Also normalize common variations
        const titleWords = pageTitle.toLowerCase().split(/\s+/);
        const textWords = text.toLowerCase().split(/\s+/);
        
        const isDuplicateTitle = 
          tagName === 'h1' || 
          normText === normTitle || 
          normText === 'about' ||
          normText === 'aboutus' ||
          normText === 'discovervediccluture' || // handle spelling typo in raw html
          normText === 'discoverayurveda' ||
          normText === 'ouringredients' ||
          normText === 'csrandphilanthropy' ||
          normText === 'ourteam' ||
          normText === 'spritualhomeomvedic'; // typo in HTML heading

        if (isDuplicateTitle) {
          return;
        }

        const cleanEl = node.cloneNode(true);
        const classList = Array.from(cleanEl.classList);
        const filteredClasses = classList.filter(c => c === 'banner-title' || c === 'text-justify' || c === 'text-center' || c === 'text-left' || c === 'text-right');
        
        if (filteredClasses.length > 0) {
          cleanEl.className = filteredClasses.join(' ');
        } else {
          cleanEl.removeAttribute('class');
        }

        const style = cleanEl.getAttribute('style') || '';
        if (style.includes('text-align: justify')) {
          cleanEl.classList.add('text-justify');
        } else if (style.includes('text-align: center')) {
          cleanEl.classList.add('text-center');
        } else if (style.includes('text-align: right')) {
          cleanEl.classList.add('text-right');
        } else if (style.includes('text-align: left')) {
          cleanEl.classList.add('text-left');
        }
        cleanEl.removeAttribute('style');

        const allChildren = cleanEl.getElementsByTagName('*');
        for (const child of allChildren) {
          child.removeAttribute('style');
          const childClasses = Array.from(child.classList);
          const cleanChildClasses = childClasses.filter(c => !c.startsWith('vc_') && !c.startsWith('wpb_'));
          if (cleanChildClasses.length > 0) {
            child.className = cleanChildClasses.join(' ');
          } else {
            child.removeAttribute('class');
          }
        }

        if (cleanEl.textContent.trim().length > 0 || cleanEl.querySelector('img')) {
          resultElements.push(cleanEl.outerHTML);
        }
        return;
      }

      const children = Array.from(node.childNodes);
      for (const child of children) {
        traverse(child);
      }
    }
  }

  Array.from(body.childNodes).forEach(traverse);
  return resultElements.join('\n\n');
}

for (const p of pages) {
  const filePath = `scratch/discover_pages/${p}.html`;
  if (fs.existsSync(filePath)) {
    const rawHtml = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanHtml(rawHtml, p.replace('-', ' '));
    console.log(`\nPage: ${p} | Cleaned Length: ${cleaned.length}`);
    console.log(`First 300 chars of cleaned:`);
    console.log(cleaned.substring(0, 300));
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
