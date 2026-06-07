"use client";
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function AddToCartButton({ product, variant = 'primary', showText = true, selectedVariant = null, customPrice = null, customSalePrice = null, quantity = 1 }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    const productToAdd = {
      ...product,
      selectedVariant: selectedVariant || product.selectedVariant || null
    };
    if (customPrice !== null) {
      productToAdd.price = customPrice;
    }
    if (customSalePrice !== null) {
      productToAdd.sale_price = customSalePrice;
    }
    addToCart(productToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };


  if (variant === 'icon') {
    return (
      <button 
        onClick={handleAdd}
        className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer z-20 ${
          added ? 'bg-vedicana-green text-white border-vedicana-green' : 'bg-white border border-gray-200 text-gray-900 hover:bg-vedicana-green hover:text-white hover:border-vedicana-green'
        }`}
      >
        <ShoppingCart size={18} />
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button 
        onClick={handleAdd}
        className={`rounded-md px-4 py-2 flex items-center gap-2 transition-all duration-300 shadow-sm text-sm font-medium ${
          added ? 'bg-vedicana-dark-green text-white' : 'bg-vedicana-teal text-white hover:bg-vedicana-dark-green'
        }`}
      >
        <ShoppingCart size={16} /> {added ? 'Added!' : 'Add'}
      </button>
    );
  }

  return (
    <button 
      onClick={handleAdd}
      className={`flex-1 text-white hover:bg-vedicana-dark-green rounded-md px-8 py-3 flex items-center justify-center gap-3 transition-all duration-300 shadow-md text-lg font-medium ${
        added ? 'bg-vedicana-dark-green' : 'bg-vedicana-green'
      }`}
    >
      <ShoppingCart size={22} /> {added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
