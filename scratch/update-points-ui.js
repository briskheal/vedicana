import fs from 'fs';
import path from 'path';

function updateProfileDashboard() {
  const file = path.join(process.cwd(), 'src/components/ProfileDashboard.js');
  let content = fs.readFileSync(file, 'utf8');

  // Insert Points UI below the Administrator badge (or email)
  const pointsUI = `
            {user.role === 'admin' && (
              <span className="inline-block mt-2 bg-vedicana-gold/20 text-vedicana-gold text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Administrator</span>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VediCana Rewards</span>
                <span className="text-xl font-bold text-vedicana-green flex items-center gap-1.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {user.points || 0}
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Points
              </div>
            </div>`;

  content = content.replace(
    /\{user\.role === 'admin' && \(\s*<span className="inline-block mt-2 bg-vedicana-gold\/20 text-vedicana-gold text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Administrator<\/span>\s*\)\}/g,
    pointsUI
  );

  fs.writeFileSync(file, content);
}

function updateProductDetailInfo() {
  const file = path.join(process.cwd(), 'src/components/ProductDetailInfo.js');
  let content = fs.readFileSync(file, 'utf8');

  // Insert "Earn Points" UI below the In Stock badge
  const pointsLogic = `
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-vedicana-green">₹{currentSalePrice || currentPrice}</span>
          {currentSalePrice && (
            <span className="text-lg text-gray-400 line-through">₹{currentPrice}</span>
          )}
        </div>
        {product.stock > 0 ? (
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full font-medium">In Stock</span>
        ) : (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full font-medium">Out of Stock</span>
        )}
      </div>

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

  content = content.replace(
    /<div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">[\s\S]*?<\/div>\s*<\/div>/,
    pointsLogic
  );

  fs.writeFileSync(file, content);
}

updateProfileDashboard();
updateProductDetailInfo();
console.log("Updated points UI");
