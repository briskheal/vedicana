import '../src/scripts/loadEnv.js';
import DiscoverPage from '../src/models/DiscoverPage.js';

async function check() {
  const pageData = await DiscoverPage.findOne({
    where: { slug: 'discover-vedic-culture' }
  });

  if (pageData) {
    const content = pageData.content;
    console.log("Database Content Stats:");
    console.log(`- Length: ${content.length}`);
    
    // Check for instances of "vc_align_"
    const aligns = [...content.matchAll(/vc_align_[a-z]+/g)].map(m => m[0]);
    console.log("Found alignments in database content:", aligns);
    
    // Print lines around image tags
    const imgIndex = content.indexOf('<img');
    if (imgIndex !== -1) {
      console.log("\nImage tag context in database:");
      console.log(content.substring(Math.max(0, imgIndex - 300), Math.min(content.length, imgIndex + 300)));
    }
  } else {
    console.log("Page not found in database.");
  }
}

check();
