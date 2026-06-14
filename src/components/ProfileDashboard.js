"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Package, User as UserIcon, Settings, Key, MapPin, Phone, Check } from 'lucide-react';
import LogoutButton from './LogoutButton';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function ProfileDashboard({ initialUser }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'settings'
  const [user, setUser] = useState(initialUser);

  // Settings form states
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  
  // Helper to retrieve initial address sub-fields
  const getInitialAddress = () => {
    let street = '';
    let cityVal = '';
    let stateVal = '';
    let pinVal = '';

    if (user.address) {
      try {
        const parsed = JSON.parse(user.address);
        if (parsed && typeof parsed === 'object') {
          street = parsed.address || '';
          cityVal = parsed.city || '';
          stateVal = parsed.state || '';
          pinVal = parsed.pincode || '';
        } else {
          street = user.address;
        }
      } catch {
        street = user.address;
      }
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

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations for password change
    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Current password is required to set a new password.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match.');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address: JSON.stringify({ address: streetAddress, city, state, pincode }),
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setUser(data.user);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action is permanent and cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete order.');
      }

      // Filter the deleted order out of the local state array
      setUser(prev => ({
        ...prev,
        Orders: prev.Orders.filter(o => o.id !== orderId)
      }));

      alert('Order successfully deleted.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
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
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {user.points || 0}
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Points
              </div>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${
                activeTab === 'orders'
                  ? 'bg-vedicana-green/5 text-vedicana-green'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package size={18} /> My Orders
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${
                activeTab === 'settings'
                  ? 'bg-vedicana-green/5 text-vedicana-green'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
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
                        <td className="px-3 py-2 border border-gray-300 font-mono font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-gray-600 whitespace-normal text-xs">
                          {order.OrderItems && order.OrderItems.length > 0 ? (
                            <ul className="list-disc pl-4">
                              {order.OrderItems.map(item => (
                                <li key={item.id}>
                                  {item.quantity}x {item.Product ? item.Product.name : 'Unknown Item'} {item.variant ? `(${item.variant})` : ''}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400 italic">No items recorded</span>
                          )}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-right font-bold text-vedicana-green">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-gray-700">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Razorpay'}
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'processing' || order.status === 'shipped' || order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : order.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 border border-gray-300 text-right space-x-3">
                          <a 
                            href={`/orders/${order.id}/invoice`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-vedicana-green font-medium hover:text-emerald-700 transition-colors text-xs underline"
                          >
                            Invoice
                          </a>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer text-xs underline"
                          >
                            Delete
                          </button>
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
                <Link href="/shop" className="inline-block bg-vedicana-green hover:bg-emerald-700 text-white rounded-md px-6 py-2.5 transition-colors font-medium">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}

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
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Street Address</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-gray-400">
                    <MapPin size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House number and street name"
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Town / City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Vadodara"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-white text-gray-700 font-medium"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 390001"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                  />
                </div>
              </div>

              {/* Password section */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <h3 className="text-base font-serif text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Leave these blank if you do not want to change your password.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vedicana-green/20 focus:border-vedicana-green bg-gray-50/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
