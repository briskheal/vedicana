import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/components/ProductDetailInfo.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add bundleProduct prop and useCart
content = content.replace(
  'export default function ProductDetailInfo({ product, category }) {',
  'import Image from "next/image";\nimport { useCart } from "../context/CartContext";\n\nexport default function ProductDetailInfo({ product, category, bundleProduct }) {'
);

content = content.replace(
  'const [shareUrl, setShareUrl] = useState(\'\');',
  'const [shareUrl, setShareUrl] = useState(\'\');\n  const { addToCart } = useCart();'
);

// 2. Insert "Earn Points" right after the price/stock div.
const priceDivEnd = `        )}
      </div>`;

const pointsLogic = `
      {/* Reward Points Callout */}
      <div className="mb-6 bg-vedicana-gold/10 border border-vedicana-gold/20 rounded-lg p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-vedicana-gold/20 flex items-center justify-center text-vedicana-gold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">VediCana Rewards</p>
          <p className="text-xs text-gray-600">Earn <span className="font-bold text-vedicana-gold">{Math.floor((currentSalePrice || currentPrice) * 0.05)} points</span> with this purchase.</p>
        </div>
      </div>`;

content = content.replace(priceDivEnd, priceDivEnd + '\n' + pointsLogic);

// 3. Insert Bundle logic before "Category Link & Share Options"
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
            className="w-full bg-gray-900 hover:bg-vedicana-green text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
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
console.log("Applied bundle and points logic to ProductDetailInfo.js");
