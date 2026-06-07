import '../src/scripts/loadEnv.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

async function check() {
  const pageData = await DiscoverPage.findOne({
    where: { slug: 'discover-ayurveda' }
  });

  if (pageData) {
    const content = pageData.content;
    console.log("Database Content Stats for Discover Ayurveda:");
    console.log(`- Length: ${content.length}`);
    
    // Check for instances of "img-wrap"
    const leftCount = (content.match(/img-wrap img-left/g) || []).length;
    const centerCount = (content.match(/img-wrap img-center/g) || []).length;
    
    console.log(`- Count of left-aligned images: ${leftCount}`);
    console.log(`- Count of center-aligned images: ${centerCount}`);
    
    // Print lines around the first image tag
    const imgIndex = content.indexOf('<img');
    if (imgIndex !== -1) {
      console.log("\nFirst image context in database:");
      console.log(content.substring(Math.max(0, imgIndex - 150), Math.min(content.length, imgIndex + 150)));
    }
  } else {
    console.log("Page not found in database.");
  }
}

check();
