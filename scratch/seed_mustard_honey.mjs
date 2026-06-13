import models from '../src/models/index.js';
import fs from 'fs';
import path from 'path';

async function seedMustardHoney() {
  const imagePath = 'C:\\Users\\J S DASH\\.gemini\\antigravity\\brain\\39249ead-7316-4fbe-b96b-f310e201354a\\vedicana_mustard_honey_1781358145190.png';
  let base64Image = '';
  
  if (fs.existsSync(imagePath)) {
    const fileData = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
  } else {
    console.log("Image not found at path!");
    return;
  }

  // Find Honey Corner category
  const category = await models.Category.findOne({ where: { name: 'Honey Corner' } });
  const categoryId = category ? category.id : null;

  const description = `<p class="text-justify"><strong>Mustard Honey</strong> is known for its distinct, robust flavor and naturally warming properties. Harvested from vibrant yellow mustard fields, it acts as a powerful natural energy booster and is packed with essential minerals and antioxidants.</p>
          <h3 class="text-xl font-serif text-vedicana-dark-green mb-3">Product Details & Benefits</h3>
          <p><strong>Benefits of Mustard Honey</strong></p>
<p><strong>1. Natural Energy Booster–</strong> High in natural, unprocessed sugars that provide an instant, sustained release of energy throughout the day.</p>
<p><strong>2. Rich in Antioxidants–</strong> Contains powerful antioxidants that help protect the body against free radical damage and oxidative stress.</p>
<p><strong>3. Soothes Throat & Colds–</strong> Known for its natural antibacterial and anti-inflammatory properties, making it an excellent remedy for soothing sore throats and coughs.</p>
<p><strong>4. Improves Digestion–</strong> Helps soothe the digestive tract and promotes healthy metabolism when consumed with warm water.</p>
<p><strong>5. Rich in Essential Minerals–</strong> A natural source of vital minerals like calcium, magnesium, and potassium which support overall health and vitality.</p>`;

  // Create the product
  const product = await models.Product.create({
    title: 'VediCana Mustard Honey',
    slug: 'vedicana-mustard-honey',
    description: description,
    price: 450,
    sale_price: 399,
    stock: 50,
    sku: 'VC-HON-MUS-01',
    is_featured: false, // User didn't say to feature it, just add to Honey Corner
    categoryId: categoryId,
    image: base64Image
  });

  console.log("Successfully created Mustard Honey! Product ID:", product.id);
}

seedMustardHoney().catch(console.error).finally(() => process.exit(0));
