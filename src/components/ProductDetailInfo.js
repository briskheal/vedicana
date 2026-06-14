'use client';

import React, { useState, useEffect } from 'react';
import AddToCartButton from './AddToCartButton';
import { Leaf, ShieldCheck, Truck, Share2 } from 'lucide-react';

function calculateVariantPrice(basePrice, selectedVariant, baseVariant) {
  const parse = (str) => {
    if (!str) return null;
    const match = str.match(/(\d+)\s*(ML|GM|KG|L)/i);
    if (!match) return null;
    return { val: parseInt(match[1], 10), unit: match[2].toUpperCase() };
  };

  const base = parse(baseVariant);
  const sel = parse(selectedVariant);

  if (!base || !sel || base.unit !== sel.unit || base.val === 0) {
    return basePrice;
  }

  const ratio = sel.val / base.val;
  if (ratio === 1) return basePrice;

  let multiplier = ratio;
  if (ratio < 1) {
    multiplier = Math.max(ratio, ratio * 1.15);
  } else {
    multiplier = ratio * (1 - Math.min(0.2, (ratio - 1) * 0.08));
  }

  const estimated = basePrice * multiplier;
  return Math.round(estimated / 5) * 5;
}

import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function ProductDetailInfo({ product, category, bundleProduct }) {
  const [variants, setVariants] = useState([]);
  const [structuredVariants, setStructuredVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(Number(product.price));
  const [currentSalePrice, setCurrentSalePrice] = useState(product.sale_price ? Number(product.sale_price) : null);
  const [shareUrl, setShareUrl] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  // Parse variants from product.additional_info
  useEffect(() => {
    const addInfo = product.additional_info || {};
    if (addInfo.variants && Array.isArray(addInfo.variants)) {
      setStructuredVariants(addInfo.variants);
      const parsedVariants = addInfo.variants.map(v => v.size);
      setVariants(parsedVariants);
      if (parsedVariants.length > 0) {
        setSelectedVariant(parsedVariants[0]);
      }
    } else {
      setStructuredVariants([]);
      const variantStr = addInfo.Variant || addInfo.variant || '';
      if (variantStr) {
        const parsedVariants = variantStr.split(',').map(v => v.trim()).filter(Boolean);
        setVariants(parsedVariants);
        if (parsedVariants.length > 0) {
          setSelectedVariant(parsedVariants[0]);
        }
      } else {
        setVariants([]);
      }
    }
  }, [product.additional_info]);

  // Recalculate price when selected variant changes
  useEffect(() => {
    if (variants.length > 0 && selectedVariant) {
      const matched = structuredVariants.find(sv => sv.size === selectedVariant);
      if (matched) {
        setCurrentPrice(Number(matched.price));
        setCurrentSalePrice(matched.sale_price ? Number(matched.sale_price) : null);
      } else {
        const baseVariant = variants[0];
        const basePrice = Number(product.price);
        const baseSalePrice = product.sale_price ? Number(product.sale_price) : null;

        const calcPrice = calculateVariantPrice(basePrice, selectedVariant, baseVariant);
        setCurrentPrice(calcPrice);

        if (baseSalePrice !== null) {
          const calcSalePrice = calculateVariantPrice(baseSalePrice, selectedVariant, baseVariant);
          setCurrentSalePrice(calcSalePrice);
        } else {
          setCurrentSalePrice(null);
        }
      }
    }
  }, [selectedVariant, variants, structuredVariants, product.price, product.sale_price]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const encUrl = encodeURIComponent(shareUrl || `https://vedicana.com/product/${product.slug}`);
  const encTitle = encodeURIComponent(product.title);

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center font-sans">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 mb-4 leading-tight">{product.title}</h1>
      
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

      <div 
        className="text-[0.95rem] text-gray-600 mb-6 leading-relaxed product-description"
        dangerouslySetInnerHTML={{ 
          __html: (product.short_description && product.short_description.replace(/<[^>]*>/g, '').trim().length > 0)
            ? product.short_description 
            : product.description 
        }} 
      />

      {/* Dynamic Size Variant Selector */}
      {variants.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3">Select Variant:</h4>
          <div className="flex flex-wrap gap-4 items-start">
            {variants.map(v => {
              let vPrice = null;
              let vSalePrice = null;
              
              const matched = structuredVariants.find(sv => sv.size === v);
              if (matched) {
                vPrice = Number(matched.price);
                vSalePrice = matched.sale_price ? Number(matched.sale_price) : null;
              } else {
                const baseVariant = variants[0];
                const basePrice = Number(product.price);
                const baseSalePrice = product.sale_price ? Number(product.sale_price) : null;
                
                vPrice = calculateVariantPrice(basePrice, v, baseVariant);
                if (baseSalePrice !== null) {
                  vSalePrice = calculateVariantPrice(baseSalePrice, v, baseVariant);
                }
              }

              const displayPrice = vSalePrice || vPrice;
              
              return (
                <div key={v} className="flex flex-col items-center gap-1.5 min-w-[64px]">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      selectedVariant === v
                        ? 'border-2 border-vedicana-green bg-emerald-50/20 text-vedicana-green shadow-[0_0_10px_rgba(0,109,57,0.15)] font-extrabold scale-105'
                        : 'bg-white border-gray-200 text-gray-700 hover:text-vedicana-green hover:border-vedicana-green/50 hover:scale-102'
                    }`}
                  >
                    {v}
                  </button>
                  <span className={`text-[11px] font-mono transition-all ${
                    selectedVariant === v ? 'text-vedicana-green font-bold' : 'text-gray-400 font-medium'
                  }`}>
                    ₹{displayPrice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <div className="flex items-center border border-gray-300 rounded-md w-32 bg-white">
          <button 
            type="button"
            onClick={() => handleQtyChange(quantity - 1)}
            className="w-10 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-xl font-bold transition-colors cursor-pointer"
          >
            -
          </button>
          <input 
            type="text" 
            value={quantity} 
            readOnly 
            className="w-full text-center border-none focus:outline-none text-lg font-medium text-gray-800 bg-transparent" 
          />
          <button 
            type="button"
            onClick={() => handleQtyChange(quantity + 1)}
            className="w-10 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-xl font-bold transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
        
        <AddToCartButton 
          product={product} 
          selectedVariant={selectedVariant || null}
          customPrice={currentPrice}
          customSalePrice={currentSalePrice}
          quantity={quantity}
        />
      </div>

      
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

      {/* Category Link & Share Options */}
      <div className="border-t border-gray-150/80 pt-5 mt-2 space-y-4 text-xs font-medium text-gray-500">
        {category && (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Category:</span>
            <a 
              href={`/shop?category=${category.slug}`} 
              className="text-vedicana-green hover:text-emerald-700 uppercase font-bold tracking-wider hover:underline"
            >
              {category.name}
            </a>
          </div>
        )}
        
        {/* Share Social Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 border-t border-gray-100 mt-2">
          <span className="text-gray-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
            <Share2 size={12} /> Share this remedy:
          </span>
          <div className="flex items-center gap-2">
            {/* Facebook */}
            <a 
              href={`https://www.facebook.com/sharer.php?u=${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center text-gray-500 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all duration-300"
              title="Share on Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            {/* Twitter / X */}
            <a 
              href={`https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              title="Share on Twitter / X"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a 
              href={`https://api.whatsapp.com/send?text=${encTitle}%20${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center text-gray-500 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all duration-300"
              title="Share on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.665.989 3.3 1.488 5.274 1.49 5.371 0 9.742-4.305 9.746-9.6.002-2.565-1.002-4.978-2.825-6.798C16.82 2.427 14.415 1.42 11.99 1.42c-5.38 0-9.754 4.31-9.758 9.602-.002 2.019.531 3.992 1.543 5.729l-.997 3.639 3.812-.996zM17.15 14.94c-.284-.141-1.68-.823-1.94-.916-.26-.094-.45-.141-.64.141-.19.284-.736.916-.902 1.103-.166.187-.332.21-.616.07-1.127-.565-2.05-1.03-2.86-1.742-.693-.61-1.162-1.363-1.298-1.6-.136-.237-.015-.365.105-.484.108-.108.284-.332.426-.5.142-.167.19-.283.284-.47.095-.188.048-.354-.024-.495-.07-.141-.64-1.536-.877-2.107-.23-.554-.462-.48-.64-.49-.166-.008-.356-.01-.546-.01-.19 0-.5.07-.76.353-.26.284-1 .974-1 2.375s1.022 2.753 1.164 2.942c.142.188 2.012 3.037 4.875 4.258.68.29 1.21.464 1.62.593.687.218 1.312.187 1.806.114.55-.082 1.68-.68 1.916-1.338.237-.658.237-1.223.166-1.338-.071-.116-.26-.188-.544-.33z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center text-gray-500 hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] transition-all duration-300"
              title="Share on LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            {/* Pinterest */}
            <a 
              href={`https://pinterest.com/pin/create/button/?url=${encUrl}&description=${encTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center text-gray-500 hover:bg-[#bd081c] hover:text-white hover:border-[#bd081c] transition-all duration-300"
              title="Share on Pinterest"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Leaf className="text-vedicana-green" size={24} />
          <span className="text-sm font-medium text-gray-700">100% Ayurvedic</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <ShieldCheck className="text-vedicana-gold" size={24} />
          <span className="text-sm font-medium text-gray-700">Quality Tested</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
          <Truck className="text-vedicana-teal" size={24} />
          <span className="text-sm font-medium text-gray-700">Free Shipping on Orders of ₹500 or more! 🚚</span>
        </div>
      </div>
    </div>
  );
}
