import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// Clean functions
function cleanHtml(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const body = doc.body;

  const resultElements = [];

  function traverse(node) {
    if (!node) return;

    // Check if it's an element node
    if (node.nodeType === 1) { // Node.ELEMENT_NODE
      const tagName = node.tagName.toLowerCase();
      const className = typeof node.className === 'string' ? node.className : '';

      // Check if it's an image wrapper or an img tag
      if (className.includes('img-wrap') || tagName === 'img') {
        let imgWrap;
        if (tagName === 'img') {
          // Wrap it
          imgWrap = doc.createElement('div');
          imgWrap.className = 'img-wrap img-center';
          const clonedImg = node.cloneNode(true);
          imgWrap.appendChild(clonedImg);
        } else {
          imgWrap = node.cloneNode(true);
        }
        
        // Clean the img element inside
        const img = imgWrap.querySelector('img');
        if (img) {
          // Restore lazy loaded src if needed
          const lazySrc = img.getAttribute('data-lazy-src');
          if (lazySrc) {
            img.setAttribute('src', lazySrc);
            img.removeAttribute('data-lazy-src');
          }
          // Remove WooCommerce lazy sizes attributes
          img.removeAttribute('srcset');
          img.removeAttribute('sizes');
          img.removeAttribute('class'); // Clean classes inside image
        }

        // Clean caption span inside
        const captionSpan = imgWrap.querySelector('.caption') || imgWrap.querySelector('span');
        if (captionSpan) {
          const cleanSpan = doc.createElement('span');
          cleanSpan.className = 'caption';
          cleanSpan.textContent = captionSpan.textContent.trim();
          // Remove old span, append clean one
          if (img.nextSibling) {
            imgWrap.insertBefore(cleanSpan, img.nextSibling);
          } else {
            imgWrap.appendChild(cleanSpan);
          }
        }

        // Standardize alignment class
        let align = 'center';
        if (className.includes('img-left') || className.includes('vc_align_left')) {
          align = 'left';
        } else if (className.includes('img-right') || className.includes('vc_align_right')) {
          align = 'right';
        }
        imgWrap.className = `img-wrap img-${align}`;

        resultElements.push(imgWrap.outerHTML);
        return; // Stop traversing children of image wrapper
      }

      // Check if it's a content element we want to keep
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote', 'table'].includes(tagName)) {
        // Clone the node to clean it
        const cleanEl = node.cloneNode(true);
        
        // Remove styling/VC classes from the element itself
        const classList = Array.from(cleanEl.classList);
        const filteredClasses = classList.filter(c => c === 'banner-title' || c === 'text-justify' || c === 'text-center' || c === 'text-left' || c === 'text-right');
        
        if (filteredClasses.length > 0) {
          cleanEl.className = filteredClasses.join(' ');
        } else {
          cleanEl.removeAttribute('class');
        }

        // Keep text-align style as a class if present
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

        // Also clean up any nested elements inside (like links, strong tags)
        const allChildren = cleanEl.getElementsByTagName('*');
        for (const child of allChildren) {
          // Clear any style or vc_ classes
          child.removeAttribute('style');
          const childClasses = Array.from(child.classList);
          const cleanChildClasses = childClasses.filter(c => !c.startsWith('vc_') && !c.startsWith('wpb_'));
          if (cleanChildClasses.length > 0) {
            child.className = cleanChildClasses.join(' ');
          } else {
            child.removeAttribute('class');
          }
        }

        // Add to result if it has text or children
        if (cleanEl.textContent.trim().length > 0 || cleanEl.querySelector('img')) {
          resultElements.push(cleanEl.outerHTML);
        }
        return; // Don't traverse deeper into these block elements
      }

      // If it's a layout/wrapper tag, recursively traverse its children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        traverse(child);
      }
    }
  }

  // Traverse the body
  Array.from(body.childNodes).forEach(traverse);

  return resultElements.join('\n\n');
}

const rawHtml = fs.readFileSync('scratch/discover_pages/about.html', 'utf8');
const cleaned = cleanHtml(rawHtml);
console.log('Cleaned length:', cleaned.length);
console.log('Sample of cleaned output:');
console.log(cleaned.substring(0, 1000));
