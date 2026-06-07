"use client";
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartIcon() {
  const { cartCount } = useCart();
  
  return (
    <Link href="/cart" className="text-gray-600 hover:text-vedicana-green transition-colors relative flex items-center">
      <ShoppingCart size={22} />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-vedicana-gold text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-fade-in-up">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
