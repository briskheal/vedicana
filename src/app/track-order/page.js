"use client";
import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, ExternalLink, AlertCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrderData(null);
    setLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, contact })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      case 'returned': return -2;
      default: return 1;
    }
  };

  const currentStep = orderData ? getStatusStep(orderData.status) : 0;

  return (
    <div className="min-h-screen bg-[#f9f9fa] py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">Track Your Order</h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            Enter your Order ID and the Email or Phone number used during checkout to see your live shipping status.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Order ID <span className="text-red-500">*</span></label>
              <div className="relative">
                <ShoppingBag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 1042"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email or Phone <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                placeholder="Billing email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 py-2.5 bg-vedicana-dark-green hover:bg-vedicana-green text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2 h-[42px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Track <Search size={16} /></>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {orderData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="bg-gray-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-lg">Order #{orderData.id}</h2>
                <p className="text-gray-400 text-xs mt-0.5">Placed on {new Date(orderData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${orderData.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 
                    orderData.status === 'cancelled' || orderData.status === 'returned' ? 'bg-red-500/20 text-red-400' : 
                    'bg-amber-500/20 text-amber-400'}`}
                >
                  {orderData.status}
                </span>
                <p className="text-gray-400 text-xs mt-1 font-medium">Total: <span className="text-white">₹{orderData.totalAmount}</span></p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              
              {/* Status Timeline */}
              {currentStep > 0 && (
                <div className="mb-12 relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-vedicana-green -translate-y-1/2 rounded-full transition-all duration-1000 hidden sm:block"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  ></div>

                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                    
                    {/* Step 1: Placed */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${currentStep >= 1 ? 'bg-vedicana-green border-emerald-100 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>
                        <ShoppingBag size={18} />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-xs font-bold uppercase tracking-wide ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Order Placed</p>
                        {currentStep === 1 && <p className="text-[10px] text-gray-500 mt-0.5">We have received your order</p>}
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${currentStep >= 2 ? 'bg-vedicana-green border-emerald-100 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>
                        <Package size={18} />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-xs font-bold uppercase tracking-wide ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</p>
                        {currentStep === 2 && <p className="text-[10px] text-gray-500 mt-0.5">Packing your items</p>}
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${currentStep >= 3 ? 'bg-vedicana-green border-emerald-100 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>
                        <Truck size={18} />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-xs font-bold uppercase tracking-wide ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</p>
                        {currentStep === 3 && orderData.trackingNumber && <p className="text-[10px] text-gray-500 mt-0.5">On the way to you</p>}
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${currentStep >= 4 ? 'bg-vedicana-green border-emerald-100 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}>
                        <CheckCircle size={18} />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-xs font-bold uppercase tracking-wide ${currentStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</p>
                        {currentStep === 4 && <p className="text-[10px] text-gray-500 mt-0.5">Enjoy your purchase!</p>}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Courier Info */}
              {orderData.trackingNumber && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Shipping Details</h3>
                    <p className="text-sm text-gray-600">
                      Shipped via <span className="font-semibold text-gray-900">{orderData.courierPartner || 'Courier'}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Tracking ID: <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{orderData.trackingNumber}</span>
                    </p>
                    <a href={`https://www.google.com/search?q=track+${orderData.courierPartner}+${orderData.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2 uppercase tracking-wide">
                      Track on Courier Site <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Cancellation Message */}
              {currentStep < 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-1">Order {orderData.status}</h3>
                    <p className="text-xs text-red-600">This order has been {orderData.status}. If you have any questions or need a refund, please contact support.</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Items in this order</h3>
              <div className="space-y-4">
                {orderData.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">Size: {item.variant}</p>}
                      <p className="text-xs font-medium text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
