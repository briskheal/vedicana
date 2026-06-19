import fs from 'fs';
import path from 'path';

function fixProfileDashboard() {
  const file = path.join(process.cwd(), 'src/components/ProfileDashboard.js');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Admin Dashboard\n              <\/a>/g, 'Admin Dashboard\n              </Link>');
  fs.writeFileSync(file, content);
}

function fixShopPage() {
  const file = path.join(process.cwd(), 'src/app/shop/page.js');
  let content = fs.readFileSync(file, 'utf8');
  // I changed <a ...> to <Link> around the image, but missed the </a>
  // The structure is:
  // <Link href="..." className="w-full h-full bg-vedicana-bg flex items-center justify-center relative">
  //   <Image ... />
  // </a>
  // Let's replace </a> with </Link> right before `{product.sale_price &&`
  content = content.replace(/<\/a>\n                  \{product\.sale_price/g, '</Link>\n                  {product.sale_price');
  fs.writeFileSync(file, content);
}

function fixRelatedProducts() {
  const file = path.join(process.cwd(), 'src/components/RelatedProductsCarousel.js');
  let content = fs.readFileSync(file, 'utf8');
  // Similar issue: </a> right before `{relProduct.sale_price && (`
  content = content.replace(/<\/a>\n                  \{relProduct\.sale_price/g, '</Link>\n                  {relProduct.sale_price');
  content = content.replace(/<\/a>\n                \{relProduct\.sale_price/g, '</Link>\n                {relProduct.sale_price'); // for mobile grid
  fs.writeFileSync(file, content);
}

fixProfileDashboard();
fixShopPage();
fixRelatedProducts();
console.log("Fixes applied.");
