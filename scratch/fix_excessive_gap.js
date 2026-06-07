import 'dotenv/config';
import Product from '../src/models/Product.js';

async function fix() {
  try {
    const products = await Product.findAll();
    console.log(`Found ${products.length} products to check and adjust spacing.`);
    
    let updatedCount = 0;
    for (const p of products) {
      let desc = p.description || '';
      if (!desc) continue;
      
      // Replace excessive margin classes with smaller values
      let updatedDesc = desc
        .replace(/class="short-description mb-6"/g, 'class="short-description mb-3.5"')
        .replace(/class="detailed-description mt-6 border-t border-gray-100 pt-6"/g, 'class="detailed-description mt-3.5 border-t border-gray-100 pt-3.5"')
        .replace(/class="text-xl font-serif text-vedicana-dark-green mb-4"/g, 'class="text-xl font-serif text-vedicana-dark-green mb-3"');
        
      if (desc !== updatedDesc) {
        await Product.update(
          { description: updatedDesc },
          { where: { id: p.id } }
        );
        updatedCount++;
        console.log(`  [ADJUSTED] Spacings for: "${p.title}"`);
      }
    }
    console.log(`\nSuccessfully adjusted spacings for ${updatedCount} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Error during spacing adjustment:', err);
    process.exit(1);
  }
}

fix();
