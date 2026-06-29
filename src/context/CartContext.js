"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vedicana_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('vedicana_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    // Automatically remove product from wishlist on cart add (guest storage & api)
    try {
      const guestList = JSON.parse(localStorage.getItem('vc_guest_wishlist') || '[]');
      if (guestList.includes(product.id)) {
        const updated = guestList.filter(id => id !== product.id);
        localStorage.setItem('vc_guest_wishlist', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to update guest wishlist in localStorage:', e);
    }

    fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id })
    }).catch(err => console.error('Wishlist removal error on cart add:', err));

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && (item.selectedVariant || null) === (product.selectedVariant || null));
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && (item.selectedVariant || null) === (product.selectedVariant || null)) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId, selectedVariant = null) => {
    setCart(prev => prev.filter(item => !(item.id === productId && (item.selectedVariant || null) === (selectedVariant || null))));
  };

  const updateQuantity = (productId, quantity, selectedVariant = null) => {
    if (quantity < 1) return removeFromCart(productId, selectedVariant);
    setCart(prev => prev.map(item => 
      (item.id === productId && (item.selectedVariant || null) === (selectedVariant || null)) ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => {
    const price = item.sale_price ? Number(item.sale_price) : Number(item.price);
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      cartTotal: 0,
      cartCount: 0
    };
  }
  return context;
};
