import fs from 'fs';
import path from 'path';

function fixShopPage() {
  const file = path.join(process.cwd(), 'src/app/shop/page.js');
  let content = fs.readFileSync(file, 'utf8');
  
  // Looking for the closing </a> right before the description div
  // </a>
  // <div 
  //   className="text-sm text-gray-550 mb-6 line-clamp-2"
  content = content.replace(/<\/a>\n                  <div \n                    className="text-sm text-gray-550 mb-6 line-clamp-2"/g, '</Link>\n                  <div \n                    className="text-sm text-gray-550 mb-6 line-clamp-2"');
  fs.writeFileSync(file, content);
}

function fixRelatedProducts() {
  const file = path.join(process.cwd(), 'src/components/RelatedProductsCarousel.js');
  let content = fs.readFileSync(file, 'utf8');
  
  // Looking for the closing </a> right before the price div
  // </a>
  // <div className="flex justify-between items-center mt-auto pt-3 border-t...
  content = content.replace(/<\/a>\n                  <div className="flex justify-between items-center mt-auto pt-3 border-t/g, '</Link>\n                  <div className="flex justify-between items-center mt-auto pt-3 border-t');
  
  // Also check the mobile block
  // </a>
  // <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
  content = content.replace(/<\/a>\n                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">/g, '</Link>\n                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">');
  
  fs.writeFileSync(file, content);
}

fixShopPage();
fixRelatedProducts();
console.log("Fixes 2 applied.");
