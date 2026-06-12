"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { Truck, ArrowRight, Lock, CheckCircle, Tag, Wallet, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi_direct');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  // UPI QR Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrOrderId, setQrOrderId] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  
  const [formData, setFormData] = useState({
    billingFirstName: '',
    billingLastName: '',
    billingCompanyName: '',
    billingCountry: 'India',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    billingPhone: '',
    billingEmail: '',
    shipToDifferentAddress: false,
    shippingFirstName: '',
    shippingLastName: '',
    shippingCompanyName: '',
    shippingCountry: 'India',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
    orderNotes: ''
  });

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0 && !isProcessing) {
      router.push('/cart');
    }
  }, [cart, router, isProcessing]);

  // (Razorpay script loading removed)

  // Auto-apply won coupon from Spin Wheel on load
  useEffect(() => {
    if (typeof window !== 'undefined' && cartTotal > 0 && !appliedCoupon) {
      const wonCoupon = localStorage.getItem('vedicana_won_coupon');
      if (wonCoupon) {
        const autoApply = async () => {
          try {
            const res = await fetch('/api/coupons/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: wonCoupon, cartTotal })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
              setAppliedCoupon(data.coupon);
              setDiscountAmount(data.discountAmount);
              setCouponCode(wonCoupon);
            }
          } catch (err) {
            console.error("Auto-apply won coupon error:", err);
          }
        };
        autoApply();
      }
    }
  }, [cartTotal, appliedCoupon]);

  // Auto-capture logged-in user profile details for Billing Form
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.loggedIn && data.user) {
          const nameParts = data.user.name ? data.user.name.split(' ') : [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          let streetAddress = '';
          let city = '';
          let state = '';
          let pincode = '';

          if (data.user.address) {
            try {
              const parsed = JSON.parse(data.user.address);
              if (parsed && typeof parsed === 'object') {
                streetAddress = parsed.address || '';
                city = parsed.city || '';
                state = parsed.state || '';
                pincode = parsed.pincode || '';
              } else {
                streetAddress = data.user.address;
              }
            } catch {
              streetAddress = data.user.address;
            }
          }

          setFormData(prev => ({
            ...prev,
            billingFirstName: firstName,
            billingLastName: lastName,
            billingEmail: data.user.email || '',
            billingPhone: data.user.phone || '',
            billingAddress: streetAddress,
            billingCity: city,
            billingState: state,
            billingPincode: pincode
          }));
        }
      } catch (err) {
        console.error("Failed to auto-capture profile billing details:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;

    try {
      // Create a quick API endpoint to validate the coupon
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal })
      });
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error applying coupon');
    }
  };

  const shippingFee = cartTotal < 500 ? 50 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount) + shippingFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Create order on server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          shippingInfo: formData,
          paymentMethod,
          couponCode: appliedCoupon?.code || null
        })
      });

      const orderData = await res.json();

      if (orderData.error) {
        throw new Error(orderData.error);
      }

      if (orderData.method === 'cod') {
        // COD Success
        clearCart();
        router.push(`/checkout/success?order_id=${orderData.orderId}`);
      } else if (orderData.method === 'upi_direct') {
        // Show UPI QR Modal
        setQrOrderId(orderData.internalOrderId);
        setShowQRModal(true);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Error initiating checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleUPIVerify = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 10) {
      alert("Please enter a valid UTR / Transaction ID (usually 12 digits)");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: qrOrderId,
          utr: utrNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/checkout/success?order_id=${qrOrderId}`);
      } else {
        alert(data.error || "Verification submission failed.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("UPI Verify Error:", err);
      alert("Error submitting UTR. Please try again.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null; 

  return (
    <div className="min-h-screen bg-[#f9f9fa] py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb matching WooCommerce */}
        <div className="text-xs text-gray-500 mb-6 border-b border-gray-200/60 pb-3 flex items-center gap-1.5 font-medium">
          <span className="text-gray-400 hover:text-vedicana-green cursor-pointer transition-colors" onClick={() => router.push('/cart')}>Cart</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Checkout</span>
        </div>

        {/* Confetti celebration banner if FIRSTSPIN10 is applied */}
        {appliedCoupon && appliedCoupon.code === 'FIRSTSPIN10' && (
          <div className="bg-emerald-50/80 border-l-4 border-emerald-500 p-4 mb-6 rounded-lg shadow-xs text-xs text-emerald-800 flex items-center gap-3 animate-fade-in-up">
            <span className="text-xl animate-bounce">🎉</span>
            <div>
              <p className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">Lottery Prize Applied!</p>
              <p className="text-emerald-800/90 font-light mt-0.5 leading-relaxed">Your 10% First-Time discount won on the Spin Wheel (FIRSTSPIN10) has been automatically applied to your cart!</p>
            </div>
          </div>
        )}

        {/* Coupon Header (WooCommerce Style) */}
        {!appliedCoupon && (
          <div className="bg-white border border-gray-200 border-t-4 border-t-vedicana-green p-3 mb-6 rounded-lg text-xs text-gray-600 flex items-center gap-1.5 shadow-xs">
            <Tag size={14} className="text-vedicana-green" /> Have a coupon? 
            <button type="button" className="text-vedicana-green hover:underline font-semibold" onClick={() => document.getElementById('coupon-section').classList.toggle('hidden')}>
              Click here to enter your code
            </button>
          </div>
        )}

        <form id="coupon-section" onSubmit={handleApplyCoupon} className="hidden mb-6 max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-xs animate-fade-in-up">
          <p className="text-gray-500 text-xs mb-3">If you have a coupon code, please apply it below.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Coupon code" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value)}
              className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-all" 
            />
            <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors">Apply</button>
          </div>
          {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
        </form>

        <form onSubmit={handleCheckout} className="flex flex-col lg:flex-row gap-8">
          
          {/* Billing & Shipping Details (Left) */}
          <div className="lg:w-[57%] space-y-6">
            
            {/* Billing details card */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200/60 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2.5">Billing details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">First name <span className="text-red-500">*</span></label>
                  <input required type="text" name="billingFirstName" value={formData.billingFirstName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last name <span className="text-red-500">*</span></label>
                  <input required type="text" name="billingLastName" value={formData.billingLastName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company name (optional)</label>
                  <input type="text" name="billingCompanyName" value={formData.billingCompanyName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country / Region <span className="text-red-500">*</span></label>
                  <select name="billingCountry" value={formData.billingCountry} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green bg-gray-50/40 pointer-events-none text-gray-500">
                    <option value="India">India</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Street address <span className="text-red-500">*</span></label>
                  <input required type="text" name="billingAddress" placeholder="House number and street name" value={formData.billingAddress} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
                
                {/* Town, State, Pincode in a single grid row */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Town / City <span className="text-red-500">*</span></label>
                    <input required type="text" name="billingCity" value={formData.billingCity} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">State <span className="text-red-500">*</span></label>
                    <select required name="billingState" value={formData.billingState} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green bg-white text-gray-700">
                      <option value="">State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">PIN Code <span className="text-red-500">*</span></label>
                    <input required type="text" name="billingPincode" value={formData.billingPincode} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone <span className="text-red-500">*</span></label>
                  <input required type="tel" name="billingPhone" value={formData.billingPhone} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email address <span className="text-red-500">*</span></label>
                  <input required type="email" name="billingEmail" value={formData.billingEmail} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                </div>
              </div>
            </div>

            {/* Shipping Details Toggle */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200/60 shadow-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="shipToDifferentAddress"
                  checked={formData.shipToDifferentAddress}
                  onChange={handleInputChange}
                  className="w-4.5 h-4.5 text-vedicana-green rounded border-gray-300 focus:ring-vedicana-green"
                />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ship to a different address?</span>
              </label>

              {formData.shipToDifferentAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-4 pt-4 border-t border-gray-100 animate-fade-in-up">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">First name <span className="text-red-500">*</span></label>
                    <input required={formData.shipToDifferentAddress} type="text" name="shippingFirstName" value={formData.shippingFirstName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last name <span className="text-red-500">*</span></label>
                    <input required={formData.shipToDifferentAddress} type="text" name="shippingLastName" value={formData.shippingLastName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Company name (optional)</label>
                    <input type="text" name="shippingCompanyName" value={formData.shippingCompanyName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Country / Region <span className="text-red-500">*</span></label>
                    <select name="shippingCountry" value={formData.shippingCountry} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green bg-gray-50/40 pointer-events-none text-gray-500">
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Street address <span className="text-red-500">*</span></label>
                    <input required={formData.shipToDifferentAddress} type="text" name="shippingAddress" placeholder="House number and street name" value={formData.shippingAddress} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                  </div>
                  
                  {/* Town, State, Pincode in a single grid row */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Town / City <span className="text-red-500">*</span></label>
                      <input required={formData.shipToDifferentAddress} type="text" name="shippingCity" value={formData.shippingCity} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">State <span className="text-red-500">*</span></label>
                      <select required={formData.shipToDifferentAddress} name="shippingState" value={formData.shippingState} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green bg-white text-gray-700">
                        <option value="">State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">PIN Code <span className="text-red-500">*</span></label>
                      <input required={formData.shipToDifferentAddress} type="text" name="shippingPincode" value={formData.shippingPincode} onChange={handleInputChange} className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information Card */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200/60 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Additional information</h3>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Order notes (optional)</label>
                <textarea 
                  name="orderNotes" 
                  rows="2" 
                  placeholder="Notes about your order, e.g. special notes for delivery." 
                  value={formData.orderNotes} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-gray-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-vedicana-green focus:border-vedicana-green transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Your Order (Right) */}
          <div className="lg:w-[43%]">
            <div className="border border-gray-200 shadow-xs p-4 md:p-5 rounded-lg bg-white sticky top-24 border-t-4 border-t-vedicana-green">
              <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-100 pb-1.5">Your order</h3>
              
              <table className="w-full mb-3 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="text-right py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {cart.map((item) => (
                    <tr key={`${item.id}-${item.selectedVariant || 'default'}`} className="border-b border-gray-100/60">
                      <td className="py-1.5 text-gray-600 font-medium">
                        {item.title}
                        {item.selectedVariant && (
                          <span className="text-[10px] text-vedicana-green bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/60 ml-2 font-semibold">
                            {item.selectedVariant}
                          </span>
                        )}
                        <strong className="text-gray-900 ml-1.5 font-bold">× {item.quantity}</strong>
                      </td>
                      <td className="py-1.5 text-right font-semibold text-gray-900">
                        ₹{(item.sale_price || item.price) * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-xs">
                  <tr className="border-b border-gray-100/60 text-xs">
                    <th className="text-left py-1.5 font-semibold text-gray-500">Subtotal</th>
                    <td className="py-1.5 text-right font-semibold text-gray-900">₹{cartTotal}</td>
                  </tr>
                  {appliedCoupon && (
                    <tr className="border-b border-gray-100/60 text-vedicana-green font-bold">
                      <th className="text-left py-1.5">Coupon: {appliedCoupon.code}</th>
                      <td className="py-1.5 text-right">-₹{discountAmount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-100/60 text-xs">
                    <th className="text-left py-1.5 font-semibold text-gray-500">Shipping</th>
                    <td className="py-1.5 text-right font-semibold text-gray-900">
                      {shippingFee > 0 ? `₹${shippingFee}` : 'Free shipping'}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left py-2 text-sm font-bold text-gray-900 uppercase tracking-wider">Total</th>
                    <td className="py-2 text-right text-base font-extrabold text-vedicana-green">₹{finalTotal}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Methods */}
              <div className="space-y-1.5 mb-3.5">
                
                {/* UPI Direct Option */}
                <div 
                  className={`p-2.5 rounded-md border transition-all cursor-pointer ${paymentMethod === 'upi_direct' ? 'border-vedicana-green bg-emerald-50/5' : 'border-gray-200 bg-white hover:bg-gray-50/50'}`}
                  onClick={() => setPaymentMethod('upi_direct')}
                >
                  <div className="flex items-start gap-2">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="upi_direct"
                      checked={paymentMethod === 'upi_direct'}
                      onChange={() => setPaymentMethod('upi_direct')}
                      className="mt-0.5 text-vedicana-green focus:ring-vedicana-green"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 leading-none">
                        Pay via UPI App <QrCode size={12} className="text-gray-400" />
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">0% Processing Fee — GPay, PhonePe, Paytm</p>
                      {paymentMethod === 'upi_direct' && (
                        <div className="text-[10px] text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100/60 leading-relaxed animate-fade-in-up">
                          Pay directly to our bank account by scanning a secure QR code. 
                          Your order will be verified manually.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div 
                  className={`p-2.5 rounded-md border transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-vedicana-green bg-emerald-50/5' : 'border-gray-200 bg-white hover:bg-gray-50/50'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-start gap-2">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 text-vedicana-green focus:ring-vedicana-green"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 leading-none">
                        Cash on delivery <Wallet size={12} className="text-gray-400" />
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Pay with cash upon delivery</p>
                      {paymentMethod === 'cod' && (
                        <div className="text-[10px] text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100/60 leading-relaxed animate-fade-in-up">
                          Pay with cash upon delivery.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              
              <p className="text-[9.5px] text-gray-400 mb-3.5 leading-relaxed">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
              </p>
              
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-vedicana-dark-green hover:bg-vedicana-green text-white rounded-lg py-2.5 flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 text-xs disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:translate-y-0.5 animate-pulse-slow"
              >
                {isProcessing ? 'Processing...' : 'Place order'} 
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* UPI QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="p-5 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Scan & Pay</h2>
              <p className="text-xs text-gray-500 mb-4">Open any UPI app to make the payment</p>
              
              <div className="bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center mb-4">
                <div className="bg-white p-2 rounded-xl shadow-sm mb-3 inline-block">
                  <QRCodeSVG 
                    value={`upi://pay?pa=8878923337@ybl&pn=JNANA RANJAN DASH&am=${finalTotal}&cu=INR&tn=Order_${qrOrderId}`}
                    size={160}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <div className="text-sm text-gray-600 mb-1">Paying to <strong className="text-gray-900">JNANA RANJAN DASH</strong></div>
                <div className="text-xs text-gray-500 font-mono bg-white px-3 py-1 rounded-full border border-gray-200">8878923337@ybl</div>
              </div>

              <div className="text-center mb-4">
                <span className="text-gray-500 text-xs">Amount to Pay</span>
                <div className="text-2xl font-extrabold text-vedicana-green">₹{finalTotal}</div>
              </div>

              <form onSubmit={handleUPIVerify} className="text-left border-t border-gray-100 pt-4">
                <label className="block text-sm font-bold text-gray-900 mb-1">Step 2: Enter UTR Number</label>
                <p className="text-[10px] text-gray-500 mb-3">After paying, enter the 12-digit UTR/Transaction ID below to confirm your order.</p>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 312345678901"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all mb-3 text-sm font-mono uppercase"
                />
                <button 
                  type="submit"
                  disabled={isProcessing || !utrNumber}
                  className="w-full bg-vedicana-dark-green hover:bg-vedicana-green text-white rounded-lg py-2.5 flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 text-xs disabled:opacity-70 shadow-md"
                >
                  {isProcessing ? 'Verifying...' : 'I Have Paid'}
                </button>
              </form>
            </div>
            {/* Close Button if they want to cancel */}
            <button 
              onClick={() => { setShowQRModal(false); setIsProcessing(false); }}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
