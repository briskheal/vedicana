"use client";
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any Ayurvedic wellness products to your cart yet.</p>
          <Link href="/shop" className="bg-vedicana-green text-white hover:bg-vedicana-dark-green rounded-md px-8 py-3 font-medium transition-colors inline-block w-full">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 hidden sm:grid grid-cols-12 text-sm text-gray-500 uppercase tracking-wider font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <li key={`${item.id}-${item.selectedVariant || 'default'}`} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.title} className="max-h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-gray-900 font-medium mb-1 line-clamp-1">{item.title}</h3>
                        {item.selectedVariant && (
                          <div className="mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-vedicana-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Size: {item.selectedVariant}
                            </span>
                          </div>
                        )}
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedVariant)}
                          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 text-center">
                      <span className="sm:hidden text-gray-500 mr-2 text-sm">Price:</span>
                      <span className="font-medium text-gray-900">₹{item.sale_price || item.price}</span>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariant)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariant)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">+</button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 text-right">
                      <span className="sm:hidden text-gray-500 mr-2 text-sm">Total:</span>
                      <span className="font-bold text-vedicana-green">₹{(item.sale_price || item.price) * item.quantity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Order Summary</h2>
              
              {/* Dynamic Shipping Progress Indicator */}
              {cartTotal < 500 ? (
                <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-4 mb-6 space-y-2">
                  <p className="text-[12.5px] text-amber-800 font-medium leading-relaxed">
                    Add <strong className="font-bold">₹{500 - cartTotal}</strong> more to qualify for <strong className="font-bold uppercase text-[9.5px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded ml-1">Free Shipping</strong>!
                  </p>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-vedicana-gold h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, (cartTotal / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 mb-6 flex items-center gap-2">
                  <span className="text-base">🚚</span>
                  <p className="text-[12.5px] text-emerald-800 font-semibold leading-relaxed">
                    Congratulations! Your order qualifies for <strong className="font-bold uppercase tracking-wider text-[9.5px] bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded">Free Shipping</strong>!
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-medium">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {cartTotal < 500 ? (
                    <span className="text-gray-900 font-medium">₹50</span>
                  ) : (
                    <span className="text-green-600 font-medium">Free</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-vedicana-green">₹{cartTotal < 500 ? cartTotal + 50 : cartTotal}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full bg-vedicana-gold hover:bg-[#e69d00] text-white rounded-md py-4 flex items-center justify-center gap-2 font-medium transition-colors shadow-md mb-4 text-lg">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <ShieldCheck size={16} className="text-vedicana-green" />
                <span>100% Secure Checkout via Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Adding an import for ShoppingCart since it's used in the Empty state
import { ShoppingCart } from 'lucide-react';
