import { JSDOM } from 'jsdom';

async function test() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Find all sliders or Swiper structures
    // Find rs-module container and dump any link or button inside it
    const module = doc.querySelector('rs-module, #rev_slider_1_1, [id*="rev_slider"]');
    if (module) {
      console.log(`Found rs-module container: ${module.tagName} id=${module.id}`);
      const links = module.querySelectorAll('a, button, [class*="button"], [class*="btn"]');
      console.log(`Found ${links.length} links/buttons inside rs-module:`);
      links.forEach((link, idx) => {
        console.log(`Link [${idx}]: tag=${link.tagName}, class=${link.className}, text="${link.textContent.trim()}", href=${link.getAttribute('href')}`);
      });
    } else {
      console.log("No rs-module container found.");
    }

  } catch (err) {
    console.error(err);
  }
}
test();
