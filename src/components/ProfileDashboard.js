"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, User as UserIcon, Settings, Key, MapPin, Phone, Check, Heart, ShoppingCart, Truck, XCircle, RotateCcw, X } from 'lucide-react';
import LogoutButton from './LogoutButton';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const STATUS_STYLES = {
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:    'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:  'bg-red-50 text-red-700 border border-red-200',
  returned:   'bg-orange-50 text-orange-700 border border-orange-200',
};

const RETURN_POLICY = `• Products must be unused, in original packaging, and in the same condition as received.
• Returns are only accepted within 7 days of delivery.
• Perishable goods (honey, ghee, oils) cannot be returned once opened.
• Refund will be processed within 7–10 business days after physical inspection of the returned item.
• Shipping cost for returns is borne by the customer.
• VediCana Organics reserves the right to reject returns that do not meet these conditions.`;

export default function ProfileDashboard({ initialUser }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'settings'
  const [user, setUser] = useState(initialUser);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Return modal state
  const [returnModal, setReturnModal] = useState(null); // orderId or null
  const [returnAgreed, setReturnAgreed] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // orderId being actioned

  // Settings form states
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');

  const getInitialAddress = () => {
    let street = '', cityVal = '', stateVal = '', pinVal = '';
    if (user.address) {
      try {
        const parsed = JSON.parse(user.address);
        if (parsed && typeof parsed === 'object') {
          street = parsed.address || ''; cityVal = parsed.city || '';
          stateVal = parsed.state || ''; pinVal = parsed.pincode || '';
        } else { street = user.address; }
      } catch { street = user.address; }
    }
    return { street, city: cityVal, state: stateVal, pincode: pinVal };
  };
  const initialAddress = getInitialAddress();
  const [streetAddress, setStreetAddress] = useState(initialAddress.street);
  const [city, setCity] = useState(initialAddress.city);
  const [state, setState] = useState(initialAddress.state);
  const [pincode, setPincode] = useState(initialAddress.pincode);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch wishlist when tab is opened
  useEffect(() => {
    if (activeTab === 'wishlist') {
      setWishlistLoading(true);
      fetch('/api/wishlist')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setWishlistItems(data); })
        .catch(console.error)
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    if (newPassword) {
      if (!currentPassword) { setErrorMsg('Current password is required.'); setLoading(false); return; }
      if (newPassword !== confirmPassword) { setErrorMsg('New passwords do not match.'); setLoading(false); return; }
      if (newPassword.length < 6) { setErrorMsg('Password must be at least 6 characters.'); setLoading(false); return; }
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone,
          address: JSON.stringify({ address: streetAddress, city, state, pincode }),
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
      setUser(data.user);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { setErrorMsg(err.message); }
    finally { setLoading(false); }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(prev => ({
        ...prev,
        Orders: prev.Orders.map(o => o.id === orderId ? { ...o, status: 'cancelled', refundStatus: o.paymentMethod === 'cod' ? 'none' : 'pending' } : o)
      }));
      alert(data.message);
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const handleReturnOrder = async () => {
    if (!returnAgreed) return;
    setActionLoading(returnModal);
    try {
      const res = await fetch(`/api/orders/${returnModal}/return`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(prev => ({
        ...prev,
        Orders: prev.Orders.map(o => o.id === returnModal ? { ...o, status: 'returned', refundStatus: o.paymentMethod === 'cod' ? 'none' : 'pending' } : o)
      }));
      setReturnModal(null); setReturnAgreed(false);
      alert(data.message);
    } catch (err) { alert(err.message); setReturnModal(null); setReturnAgreed(false); }
    finally { setActionLoading(null); }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
      setWishlistItems(prev => prev.filter(i => i.productId !== productId));
    } catch (err) { console.error(err); }
  };

  const getOrderActions = (order) => {
    const status = order.status;
    if (status === 'pending' || status === 'processing') {
      return (
        <button
          onClick={() => handleCancelOrder(order.id)}
          disabled={actionLoading === order.id}
          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-xs transition-colors disabled:opacity-50"
        >
          <XCircle size={13} /> {actionLoading === order.id ? 'Cancelling...' : 'Cancel Order'}
        </button>
      );
    }
    if (status === 'delivered') {
      const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
      const daysSince = Math.floor((new Date() - deliveredDate) / (1000 * 60 * 60 * 24));
      if (daysSince <= 7) {
        return (
          <button
            onClick={() => { setReturnModal(order.id); setReturnAgreed(false); }}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-xs transition-colors"
          >
            <RotateCcw size={13} /> Return
          </button>
        );
      }
      return <span className="text-[10px] text-gray-400 italic">Return window closed</span>;
    }
    return null;
  };

  return (
    <>
      {/* Return T&C Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReturnModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><RotateCcw size={18} className="text-orange-500" /> Return Request</h3>
              <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Please read our return policy carefully before proceeding:</p>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-xs text-gray-700 whitespace-pre-line leading-5 mb-4">
              {RETURN_POLICY}
            </div>
            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input type="checkbox" checked={returnAgreed} onChange={e => setReturnAgreed(e.target.checked)} className="mt-0.5 accent-orange-500" />
              <span className="text-sm text-gray-700">I have read and agree to the return policy terms and conditions.</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setReturnModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={handleReturnOrder}
                disabled={!returnAgreed || actionLoading === returnModal}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg py-2.5 text-sm font-bold transition-colors"
              >
                {actionLoading === returnModal ? 'Processing...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              <div className="w-20 h-20 bg-vedicana-green/10 rounded-full flex items-center justify-center text-vedicana-green mx-auto mb-4">
                <span className="text-2xl font-serif">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.name || 'User'}</h2>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-2 bg-vedicana-gold/20 text-vedicana-gold text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Administrator</span>
              )}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VediCana Rewards</span>
                  <span className="text-xl font-bold text-vedicana-green flex items-center gap-1.5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    {user.points || 0}
                  </span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Points</div>
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${activeTab === 'orders' ? 'bg-vedicana-green/5 text-vedicana-green' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Package size={18} /> My Orders
              </button>
              <button onClick={() => setActiveTab('wishlist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${activeTab === 'wishlist' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Heart size={18} /> Wishlist {wishlistItems.length > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${activeTab === 'settings' ? 'bg-vedicana-green/5 text-vedicana-green' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Settings size={18} /> Account Settings
              </button>
              {user.role === 'admin' && (
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-vedicana-gold hover:bg-vedicana-gold/5 rounded-lg transition-colors font-medium">
                  <UserIcon size={18} /> Admin Dashboard
                </Link>
              )}
              <LogoutButton />
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Order History</h2>
              {user.Orders && user.Orders.length > 0 ? (
                <div className="overflow-x-auto border border-gray-300 shadow-sm mt-4">
                  <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-[11px] font-bold">
                      <tr>
                        <th className="px-3 py-2 border border-gray-300">Order ID</th>
                        <th className="px-3 py-2 border border-gray-300">Date</th>
                        <th className="px-3 py-2 border border-gray-300 w-1/3">Items</th>
                        <th className="px-3 py-2 border border-gray-300 text-right">Amount</th>
                        <th className="px-3 py-2 border border-gray-300">Method</th>
                        <th className="px-3 py-2 border border-gray-300">Status</th>
                        <th className="px-3 py-2 border border-gray-300 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {user.Orders.map((order, idx) => (
                        <tr key={order.id} className={idx % 2 === 0 ? "bg-white hover:bg-emerald-50/30" : "bg-gray-50 hover:bg-emerald-50/30"}>
                          <td className="px-3 py-2 border border-gray-300 font-mono font-medium text-gray-900">#{order.id}</td>
                          <td className="px-3 py-2 border border-gray-300 text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-gray-600 whitespace-normal text-xs">
                            {order.OrderItems && order.OrderItems.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {order.OrderItems.map(item => (
                                  <li key={item.id}>{item.quantity}x {item.Product ? item.Product.title : 'Unknown Item'} {item.variant ? `(${item.variant})` : ''}</li>
                                ))}
                              </ul>
                            ) : <span className="text-gray-400 italic">No items recorded</span>}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-right font-bold text-vedicana-green">₹{order.totalAmount}</td>
                          <td className="px-3 py-2 border border-gray-300 text-gray-700">
                            {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'upi_direct' ? 'UPI App' : 'Razorpay'}
                            {order.upi_utr && <div className="text-[10px] text-gray-500 font-mono mt-0.5">UTR: {order.upi_utr}</div>}
                          </td>
                          <td className="px-3 py-2 border border-gray-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                              {order.status}
                            </span>
                            {/* Refund status indicator */}
                            {order.refundStatus === 'pending' && (
                              <div className="text-[10px] text-amber-600 font-medium mt-1">↩ Refund Pending</div>
                            )}
                            {order.refundStatus === 'processed' && (
                              <div className="text-[10px] text-emerald-600 font-medium mt-1">✓ Refund Processed</div>
                            )}
                            {/* Courier tracking */}
                            {order.status === 'shipped' && order.courierPartner && order.trackingNumber && (
                              <div className="mt-2 text-[10px] bg-purple-50 border border-purple-200 p-1.5 rounded text-purple-800 shadow-sm w-max max-w-[160px]">
                                <strong className="block mb-0.5 flex items-center gap-1"><Truck size={10} /> Track Order</strong>
                                <span className="block text-gray-600">By: {order.courierPartner}</span>
                                <span className="block font-mono select-all">No: {order.trackingNumber}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <a href={`/orders/${order.id}/invoice`} target="_blank" rel="noopener noreferrer"
                                className="text-vedicana-green font-medium hover:text-emerald-700 transition-colors text-xs underline">
                                Invoice
                              </a>
                              {getOrderActions(order)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                  <Package size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">When you purchase Ayurvedic products, they will appear here.</p>
                  <Link href="/shop" className="inline-block bg-vedicana-green hover:bg-emerald-700 text-white rounded-md px-6 py-2.5 transition-colors font-medium">Start Shopping</Link>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                <Heart size={22} className="text-rose-500" /> My Wishlist
              </h2>
              {wishlistLoading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-vedicana-green border-t-transparent rounded-full animate-spin"></div></div>
              ) : wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistItems.map(item => {
                    const product = item.Product;
                    if (!product) return null;
                    const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
                    const imgSrc = images[0] || '/images/placeholder.png';
                    return (
                      <div key={item.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-square bg-gray-50">
                          <img src={imgSrc} alt={product.title} className="w-full h-full object-contain p-4" onError={e => { e.target.src = '/images/placeholder.png'; }} />
                          <button
                            onClick={() => handleRemoveWishlist(product.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-rose-500 hover:text-rose-700 hover:scale-110 transition-all"
                            title="Remove from wishlist"
                          >
                            <Heart size={15} fill="currentColor" />
                          </button>
                        </div>
                        <div className="p-4">
                          <Link href={`/${product.slug}`} className="font-semibold text-gray-900 text-sm hover:text-vedicana-green line-clamp-2 block mb-2">{product.title}</Link>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-vedicana-green font-bold">₹{product.price}</span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-gray-400 line-through text-xs">₹{product.compareAtPrice}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/${product.slug}`}
                              className="flex-1 bg-vedicana-green text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center flex items-center justify-center gap-1.5">
                              <ShoppingCart size={13} /> Add to Cart
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Heart size={52} className="text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 mb-6">Save your favourite Ayurvedic products here to find them easily later.</p>
                  <Link href="/shop" className="inline-block bg-vedicana-green hover:bg-emerald-700 text-white rounded-lg px-6 py-2.5 transition-colors font-medium">Explore Shop</Link>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2">Account Settings</h2>
                <p className="text-sm text-gray-500">Update your profile parameters and manage credentials.</p>
              </div>
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Check size={16} /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">{errorMsg}</div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30 text-gray-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address (Read-only)</label>
                    <input type="email" disabled value={user.email}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Phone size={14} /></span>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210"
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30 text-gray-900" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Street Address</label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-gray-400"><MapPin size={14} /></span>
                    <input type="text" required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="House number and street name"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30 text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Town / City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Vadodara"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30 text-gray-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                    <select required value={state} onChange={e => setState(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-white text-gray-700 font-medium">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">PIN Code</label>
                    <input type="text" required value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 390001"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30 text-gray-900" />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <div>
                    <h3 className="text-base font-serif text-gray-900">Change Password</h3>
                    <p className="text-xs text-gray-500">Leave these blank if you do not want to change your password.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Current Password</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-50">
                  <button type="submit" disabled={loading}
                    className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                    {loading ? 'Saving Changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
