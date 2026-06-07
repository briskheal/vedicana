async function test() {
  try {
    const res = await fetch('https://vedicana.com/');
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);
    
    // Find all images matching uploads
    const regex = /https:\/\/vedicana\.com\/wp-content\/uploads\/[^\s"'>]+?\.(?:jpg|png|webp|jpeg)/gi;
    const matches = html.match(regex);
    if (matches) {
      const uniqueUrls = Array.from(new Set(matches));
      console.log(`Found ${uniqueUrls.length} image URLs on homepage:`);
      uniqueUrls.forEach(url => {
        if (url.includes('banner') || url.includes('slider') || url.includes('Add-a-subheading') || url.match(/\d+-\d+\.png/)) {
          console.log(`Banner potential: ${url}`);
        } else {
          console.log(`Other image: ${url}`);
        }
      });
    } else {
      console.log("No images found on homepage.");
    }
  } catch (err) {
    console.error(err);
  }
}
test();
