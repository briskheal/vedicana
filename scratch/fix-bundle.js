import fs from 'fs';
import path from 'path';

function updateSlugPage() {
  const file = path.join(process.cwd(), 'src/app/shop/[slug]/page.js');
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(
    '<ProductDetailInfo product={product} category={product.Category} />',
    '<ProductDetailInfo product={product} category={product.Category} bundleProduct={relatedProducts.length > 0 ? relatedProducts[0] : null} />'
  );
  
  fs.writeFileSync(file, content);
}

function updateProductDetailInfo() {
  const file = path.join(process.cwd(), 'src/components/ProductDetailInfo.js');
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add bundleProduct prop
  content = content.replace(
    'export default function ProductDetailInfo({ product, category }) {',
    'import Image from "next/image";\nimport { useCart } from "../context/CartContext";\n\nexport default function ProductDetailInfo({ product, category, bundleProduct }) {'
  );

  // 2. Add useCart hook inside the component
  content = content.replace(
    'const [shareUrl, setShareUrl] = useState(\'\');',
    'const [shareUrl, setShareUrl] = useState(\'\');\n  const { addToCart } = useCart();'
  );

  // 3. Add bundle logic and UI right before Category Link & Share Options
  const bundleUI = `
      {/* Frequently Bought Together Bundle */}
      {bundleProduct && (
        <div className="mb-8 p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-vedicana-gold text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider rounded-bl-lg z-10">Smart Bundle</div>
          <h4 className="text-sm font-serif font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-vedicana-green"></span> Frequently Bought Together
          </h4>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex-shrink-0 relative">
              <Image src={product.image || 'https://via.placeholder.com/100'} alt={product.title} fill className="object-contain p-1" />
            </div>
            <div className="text-gray-400 font-bold text-lg">+</div>
            <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex-shrink-0 relative group-hover:border-vedicana-green transition-colors">
              <Image src={bundleProduct.image || 'https://via.placeholder.com/100'} alt={bundleProduct.title} fill className="object-contain p-1" />
            </div>
            <div className="ml-2 flex-grow">
              <h5 className="text-[13px] font-medium text-gray-800 line-clamp-1">{bundleProduct.title}</h5>
              <div className="text-xs text-vedicana-green font-bold mt-0.5">
                + ₹{bundleProduct.sale_price || bundleProduct.price}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              // Add main product
              addToCart({
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: currentSalePrice || currentPrice,
                image: product.image,
                selectedVariant: selectedVariant
              }, quantity);
              
              // Add bundle product
              addToCart({
                id: bundleProduct.id,
                slug: bundleProduct.slug,
                title: bundleProduct.title,
                price: bundleProduct.sale_price || bundleProduct.price,
                image: bundleProduct.image,
                selectedVariant: null
              }, 1);
            }}
            className="w-full bg-gray-900 hover:bg-vedicana-green text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Add Both to Cart — ₹{(currentSalePrice || currentPrice) + Number(bundleProduct.sale_price || bundleProduct.price)}
          </button>
        </div>
      )}
`;

  content = content.replace(
    '{/* Category Link & Share Options */}',
    bundleUI + '\n      {/* Category Link & Share Options */}'
  );

  fs.writeFileSync(file, content);
}

updateSlugPage();
updateProductDetailInfo();
console.log("Bundle updates applied");
