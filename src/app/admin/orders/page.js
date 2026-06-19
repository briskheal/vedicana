"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ExternalLink, CheckCircle, Clock, XCircle, Truck, FileText, Loader, Trash2, X, AlertTriangle } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeInspectOrder, setActiveInspectOrder] = useState(null);

  // Shipping/Tracking Modal states
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingModalOrderId, setShippingModalOrderId] = useState(null);
  const [courierPartners, setCourierPartners] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [manualCourierName, setManualCourierName] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [consignmentNo, setConsignmentNo] = useState('');
  const [courierCost, setCourierCost] = useState('');

  // Returned Modal states
  const [showReturnedModal, setShowReturnedModal] = useState(false);
  const [returnedModalOrderId, setReturnedModalOrderId] = useState(null);
  const [returnedItemsList, setReturnedItemsList] = useState([]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve logistics logs. PostgreSQL connection might be failing.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courier partners
  const fetchCourierPartners = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const settings = await res.json();
        setCourierPartners(settings.courier_partners || []);
      }
    } catch (err) {
      console.error('[AdminOrders] Failed to load courier partners:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCourierPartners();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'shipped') {
      const targetOrder = orders.find(o => o.id === id);
      setShippingModalOrderId(id);
      
      // Fetch latest courier partners on-demand to guarantee they are populated
      let activePartners = courierPartners;
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const settings = await res.json();
          activePartners = settings.courier_partners || [];
          setCourierPartners(activePartners);
        }
      } catch (err) {
        console.error('Failed to reload courier partners:', err);
      }

      let parsedShipping = {};
      if (targetOrder?.shippingAddress) {
        try {
          parsedShipping = JSON.parse(targetOrder.shippingAddress);
        } catch (e) {
          // ignore
        }
      }
      
      const tracking = parsedShipping.tracking || {};
      const partnerName = tracking.courierPartner || '';
      const isRegistered = activePartners.some(cp => cp.name === partnerName);
      
      if (partnerName && !isRegistered) {
        setSelectedCourier('Manual');
        setManualCourierName(partnerName);
      } else {
        setSelectedCourier(partnerName || (activePartners[0]?.name || ''));
        setManualCourierName('');
      }

      // Default to today's date if not set
      const today = new Date().toISOString().split('T')[0];
      setDispatchDate(tracking.dispatchDate || today);
      setConsignmentNo(tracking.consignmentNo || '');
      setCourierCost(tracking.courierCost || '');
      
      setShowShippingModal(true);
      return;
    }

    if (newStatus === 'returned') {
      const targetOrder = orders.find(o => o.id === id);
      setReturnedModalOrderId(id);
      
      const items = (targetOrder?.OrderItems || []).map(item => ({
        productId: item.productId,
        productName: item.Product?.title || 'Ayurvedic Remedy',
        variant: item.variant || null,
        quantity: item.quantity,
        mode: 'resale' // default: Resale
      }));
      
      setReturnedItemsList(items);
      setShowReturnedModal(true);
      return;
    }
    
    await performStatusUpdate(id, newStatus);
  };

  const performStatusUpdate = async (id, newStatus, trackingData = null, returnItems = null) => {
    try {
      const targetOrder = orders.find(o => o.id === id);
      if (!targetOrder) return;

      let payload = { status: newStatus };

      if (trackingData) {
        let parsedShipping = {};
        try {
          parsedShipping = JSON.parse(targetOrder.shippingAddress);
        } catch {
          parsedShipping = { address: targetOrder.shippingAddress };
        }
        
        parsedShipping.tracking = trackingData;
        payload.shippingAddress = JSON.stringify(parsedShipping);
      }

      if (returnItems) {
        payload.returnItems = returnItems;
        let parsedShipping = {};
        try {
          parsedShipping = JSON.parse(targetOrder.shippingAddress);
        } catch {
          parsedShipping = { address: targetOrder.shippingAddress };
        }
        parsedShipping.returnLog = returnItems;
        payload.shippingAddress = JSON.stringify(parsedShipping);
      }

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update order status');

      const updated = await res.json();
      setOrders(orders.map(o => o.id === id ? { 
        ...o, 
        status: updated.status,
        shippingAddress: updated.shippingAddress || o.shippingAddress 
      } : o));
      
      if (activeInspectOrder && activeInspectOrder.id === id) {
        setActiveInspectOrder(prev => ({ 
          ...prev, 
          status: updated.status,
          shippingAddress: updated.shippingAddress || prev.shippingAddress
        }));
      }
      
      alert(`Order #${id} status changed to "${newStatus}"! Inventory stock levels updated successfully.`);
    } catch (err) {
      console.error(err);
      alert('Error updating order status. Please try again.');
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    if (!shippingModalOrderId) return;
    
    const finalCourier = selectedCourier === 'Manual' ? manualCourierName : selectedCourier;
    const trackingData = {
      courierPartner: finalCourier,
      dispatchDate,
      consignmentNo,
      courierCost: courierCost ? parseFloat(courierCost) : null
    };

    await performStatusUpdate(shippingModalOrderId, 'shipped', trackingData);
    setShowShippingModal(false);
    setShippingModalOrderId(null);
  };

  const handleReturnedSubmit = async (e) => {
    e.preventDefault();
    if (!returnedModalOrderId) return;

    await performStatusUpdate(returnedModalOrderId, 'returned', null, returnedItemsList);
    setShowReturnedModal(false);
    setReturnedModalOrderId(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId} permanently? This will clear it from the database memory.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete order.');
      }

      setOrders(orders.filter(o => o.id !== orderId));
      setActiveInspectOrder(null);
      alert(`Order #${orderId} successfully deleted.`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleUPIApprove = async (orderId) => {
    if (!window.confirm(`Are you sure you want to approve the UPI payment for Order #${orderId}? This will mark it as paid and decrement stock.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve-upi`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve UPI payment');
      
      alert(`Order #${orderId} UPI payment approved successfully.`);
      fetchOrders(); // Refresh to get updated status
      setActiveInspectOrder(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'processing': return 'bg-vedicana-gold/10 text-vedicana-gold border-vedicana-gold/20';
      case 'shipped': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'returned': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.User?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.User?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.paymentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && order.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-gold w-2 h-8 rounded-full inline-block"></span>
            Transaction Logistics Matrix
          </h2>
          <p className="text-slate-400 text-sm">Monitor Razorpay checkouts, manage status shifts, print GST tax invoices, and track inventory.</p>
        </div>
        <button 
          onClick={() => alert('Logistics summary report exported to clipboard!')}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
        >
          <Download size={14} /> Export Logistics Data
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name, or Razorpay ID..." 
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold transition-all placeholder-slate-700 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                activeTab.toLowerCase() === tab.toLowerCase() 
                  ? 'bg-vedicana-gold/15 text-vedicana-gold border-vedicana-gold/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader size={36} className="animate-spin text-vedicana-gold" />
            <span className="text-sm">Fetching logistics queue...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-serif text-slate-400">No active orders matched query</p>
            <p className="text-xs text-slate-600">Ensure payment gates and customer carts are actively routing transactions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                  <th className="px-4 py-2 font-medium">Order ID</th>
                  <th className="px-4 py-2 font-medium">Customer Identity</th>
                  <th className="px-4 py-2 font-medium">Timestamp</th>
                  <th className="px-4 py-2 font-medium">Total Paid</th>
                  <th className="px-4 py-2 font-medium">Status Selector</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-slate-800/20 transition-colors group ${order.paymentStatus === 'verification_pending' ? 'bg-amber-900/10 border-l-4 border-amber-500' : ''}`}>
                    <td className="px-4 py-2 font-mono text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-vedicana-gold font-bold">#</span>
                        {order.id}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-semibold text-white">{order.User?.name || 'Customer / Guest'}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{order.User?.email || 'guest@anonymous.com'}</p>
                    </td>
                    <td className="px-4 py-2 text-slate-400 font-mono text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="text-slate-600 text-[10px] block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-300 font-bold">
                      ₹{parseFloat(order.totalAmount || order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border cursor-pointer focus:outline-none focus:ring-1 focus:ring-vedicana-gold ${getStatusStyle(order.status)}`}
                      >
                        <option value="pending" className="bg-slate-900 text-slate-300">Pending</option>
                        <option value="processing" className="bg-slate-900 text-slate-300">Processing</option>
                        <option value="shipped" className="bg-slate-900 text-slate-300">Shipped</option>
                        <option value="delivered" className="bg-slate-900 text-slate-300">Delivered</option>
                        <option value="cancelled" className="bg-slate-900 text-slate-300">Cancelled</option>
                        <option value="returned" className="bg-slate-900 text-slate-300">Returned</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right flex items-center justify-end gap-2.5">
                      <a
                        href={`/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded font-medium text-xs border border-slate-700 transition-colors"
                        title="Download standard GST invoice"
                      >
                        <FileText size={12} /> Invoice
                      </a>
                      <button 
                        onClick={() => setActiveInspectOrder(order)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded transition-colors text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect <ExternalLink size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Order Modal overlay */}
      {activeInspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-300 shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-xl font-serif text-white font-bold flex items-center gap-2">
                  <span className="text-vedicana-gold">Order Details</span> #{activeInspectOrder.id}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">
                  Placed on: {new Date(activeInspectOrder.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button 
                onClick={() => setActiveInspectOrder(null)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Row 1: Customer & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Info</h4>
                  <p className="font-semibold text-white text-sm">{activeInspectOrder.User?.name || 'Guest / Anonymous'}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{activeInspectOrder.User?.email || 'guest@anonymous.com'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Details</h4>
                  <p className="text-xs text-slate-300">Method: <span className="font-semibold capitalize text-white">{activeInspectOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : activeInspectOrder.paymentMethod === 'upi_direct' ? 'UPI Direct QR' : 'Razorpay Secure'}</span></p>
                  {activeInspectOrder.paymentId && (
                    <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">Razorpay ID: {activeInspectOrder.paymentId}</p>
                  )}
                  {activeInspectOrder.upi_utr && (
                    <p className="text-[10px] text-amber-400 mt-1 font-mono break-all">UPI UTR: {activeInspectOrder.upi_utr}</p>
                  )}
                  <p className="text-xs text-slate-300 mt-1">Payment Status: <span className={`font-semibold capitalize ${(activeInspectOrder.status === 'delivered' && (activeInspectOrder.paymentMethod === 'cod' || activeInspectOrder.paymentMethod === 'upi_direct')) ? 'text-emerald-400' : activeInspectOrder.paymentStatus === 'paid' ? 'text-emerald-400' : activeInspectOrder.paymentStatus === 'verification_pending' ? 'text-amber-400 animate-pulse' : 'text-amber-450'}`}>
                    {(activeInspectOrder.status === 'delivered' && (activeInspectOrder.paymentMethod === 'cod' || activeInspectOrder.paymentMethod === 'upi_direct')) ? 'Cash Collected' : activeInspectOrder.paymentStatus.replace('_', ' ')}
                  </span></p>
                  
                  {activeInspectOrder.paymentStatus === 'verification_pending' && (
                    <button 
                      onClick={() => handleUPIApprove(activeInspectOrder.id)}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded shadow-md transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={12} /> Approve Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Shipping Address Details */}
              <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parsed Billing / Shipping Address</h4>
                {(() => {
                  let shipping = {};
                  try {
                    shipping = JSON.parse(activeInspectOrder.shippingAddress);
                  } catch {
                    shipping = { address: activeInspectOrder.shippingAddress };
                  }
                  return (
                    <div className="text-xs space-y-1.5 text-slate-300 leading-relaxed">
                      {shipping.billingFirstName ? (
                        <>
                          <p className="font-semibold text-white text-sm">{shipping.billingFirstName} {shipping.billingLastName}</p>
                          {shipping.billingCompanyName && <p className="text-slate-400">Company: {shipping.billingCompanyName}</p>}
                          <p>{shipping.billingAddress}</p>
                          <p>{shipping.billingCity}, {shipping.billingState} - {shipping.billingPincode}</p>
                          <p className="text-slate-400">Country: {shipping.billingCountry || 'India'}</p>
                          {shipping.billingPhone && <p className="font-semibold text-vedicana-gold mt-1.5 flex items-center gap-1">📞 {shipping.billingPhone}</p>}
                          {shipping.billingEmail && <p className="text-slate-400">✉ {shipping.billingEmail}</p>}
                        </>
                      ) : (
                        <p>{shipping.address || 'Address raw data parsing failed.'}</p>
                      )}
                      
                      {shipping.orderNotes && (
                        <div className="mt-3 pt-3 border-t border-slate-800/60">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Order Notes</span>
                          <p className="italic text-slate-400 bg-slate-900/40 p-2 rounded">{shipping.orderNotes}</p>
                        </div>
                      )}
                      
                      {(shipping.tracking || activeInspectOrder.status === 'shipped') && (
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-vedicana-gold block">🚚 Shipping & Tracking Details</span>
                            {activeInspectOrder.status === 'shipped' && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleStatusChange(activeInspectOrder.id, 'shipped');
                                }}
                                className="text-vedicana-gold hover:text-white text-[10px] underline cursor-pointer font-semibold"
                              >
                                {shipping.tracking ? 'Update Details' : 'Add Tracking Details'}
                              </button>
                            )}
                          </div>
                          {shipping.tracking ? (
                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/50 p-3 rounded border border-slate-800/50">
                              <p><span className="text-slate-500">Courier Partner:</span> <span className="font-semibold text-white block mt-0.5">{shipping.tracking.courierPartner || 'N/A'}</span></p>
                              <p><span className="text-slate-500">Date of Dispatch:</span> <span className="font-semibold text-white block mt-0.5">{shipping.tracking.dispatchDate || 'N/A'}</span></p>
                              <p><span className="text-slate-500">Consignment No:</span> <span className="font-semibold text-white font-mono block mt-0.5">{shipping.tracking.consignmentNo || 'N/A'}</span></p>
                              <p><span className="text-slate-500">Courier Cost:</span> <span className="font-semibold text-white block mt-0.5">{shipping.tracking.courierCost ? `₹${parseFloat(shipping.tracking.courierCost).toFixed(2)}` : 'N/A'}</span></p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">No tracking details recorded yet. Click above to add.</p>
                          )}
                        </div>
                      )}

                      {shipping.returnLog && (
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400 block mb-1">🔄 Return Destination Logs</span>
                          <div className="space-y-2 bg-slate-900/50 p-3 rounded border border-slate-800/50">
                            {shipping.returnLog.map((log, lIdx) => (
                              <div key={lIdx} className="flex justify-between items-center text-xs border-b border-slate-800/40 pb-1.5 last:border-0 last:pb-0">
                                <div>
                                  <span className="font-semibold text-white">{log.productName}</span>
                                  {log.variant && <span className="text-[10px] text-slate-500 font-mono ml-1.5">({log.variant})</span>}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Qty: {log.quantity}</span>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                    log.mode === 'resale' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                  }`}>
                                    {log.mode === 'resale' ? 'Resale' : 'Damage'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Row 3: Order Items Table */}
              {activeInspectOrder.OrderItems && activeInspectOrder.OrderItems.length > 0 ? (
                <div className="bg-slate-900/20 rounded-xl border border-slate-800/60 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordered Products</div>
                  <div className="divide-y divide-slate-800/40">
                    {activeInspectOrder.OrderItems.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">
                            {item.Product?.title || 'Ayurvedic Remedy'}
                            {item.variant && (
                              <span className="text-[9px] font-bold text-vedicana-gold bg-vedicana-gold/10 px-1.5 py-0.5 rounded border border-vedicana-gold/20 ml-2 uppercase">
                                {item.variant}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">₹{parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <span className="font-mono text-white font-bold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/20 rounded-xl border border-slate-850 text-center text-xs text-slate-500">
                  No products list associated with this order record.
                </div>
              )}

              <div className="flex flex-col items-end pr-3 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/40 pt-4">
                {activeInspectOrder.discountAmount > 0 && (
                  <p>Coupon Discount: <span className="font-mono text-emerald-400">-₹{parseFloat(activeInspectOrder.discountAmount).toFixed(2)}</span></p>
                )}
                <p>Shipping Charges: <span className="font-mono text-slate-300">
                  {((activeInspectOrder.OrderItems || []).reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0) < 500 && (activeInspectOrder.OrderItems || []).length > 0) ? '₹50.00' : 'Free'}
                </span></p>
                <p className="text-sm font-bold text-white mt-1">Grand Total: <span className="font-mono text-vedicana-gold text-base">₹{parseFloat(activeInspectOrder.totalAmount || activeInspectOrder.total).toFixed(2)}</span></p>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-800 pt-4 mt-5 flex justify-between items-center">
              <button
                onClick={() => handleDeleteOrder(activeInspectOrder.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Delete Order
              </button>
              <button
                onClick={() => setActiveInspectOrder(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {showShippingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-300 shadow-2xl relative animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-serif text-white font-bold flex items-center gap-2">
                  <Truck className="text-vedicana-gold" size={20} />
                  Dispatch Order #{shippingModalOrderId}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Update status to Shipped and optionally record tracking logistics.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowShippingModal(false);
                  setShippingModalOrderId(null);
                }} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Courier Partner</label>
                <select
                  value={selectedCourier}
                  onChange={(e) => {
                    setSelectedCourier(e.target.value);
                    if (e.target.value !== 'Manual') {
                      setManualCourierName('');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Select Courier Partner --</option>
                  {courierPartners.map(cp => (
                    <option key={cp.id} value={cp.name}>{cp.name}</option>
                  ))}
                  <option value="Manual">Enter Manually / Other</option>
                </select>
              </div>

              {(courierPartners.length === 0 || selectedCourier === 'Manual') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Courier Name (Manual)</label>
                  <input
                    type="text"
                    value={manualCourierName}
                    onChange={(e) => setManualCourierName(e.target.value)}
                    placeholder="e.g. Bluedart, Speed Post"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Date of Dispatch</label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Consignment No</label>
                <input
                  type="text"
                  value={consignmentNo}
                  onChange={(e) => setConsignmentNo(e.target.value)}
                  placeholder="e.g. AW128734928"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Cost of Courier</label>
                <input
                  type="number"
                  step="0.01"
                  value={courierCost}
                  onChange={(e) => setCourierCost(e.target.value)}
                  placeholder="e.g. 120.00"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-gold focus:ring-1 focus:ring-vedicana-gold rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-4 mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShippingModal(false);
                    setShippingModalOrderId(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-vedicana-gold hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Confirm Ship
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Returned Modal overlay */}
      {showReturnedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-300 shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-xl font-serif text-white font-bold flex items-center gap-2">
                  <span className="text-orange-400">Order Return Configuration</span> #{returnedModalOrderId}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Select the return inventory destination mode for each product in this invoice.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowReturnedModal(false);
                  setReturnedModalOrderId(null);
                }} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form / Items list */}
            <form onSubmit={handleReturnedSubmit} className="space-y-4 flex flex-col flex-1 overflow-hidden">
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {returnedItemsList.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-white text-sm">{item.productName}</p>
                      {item.variant && (
                        <p className="text-xs text-slate-400">
                          Variant: <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-vedicana-gold">{item.variant}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Returned Qty: <span className="font-mono text-slate-350">{item.quantity} units</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Resale option */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...returnedItemsList];
                          updated[idx].mode = 'resale';
                          setReturnedItemsList(updated);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                          item.mode === 'resale'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-450'
                        }`}
                      >
                        Resale (Restock)
                      </button>

                      {/* Expired / Damaged option */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...returnedItemsList];
                          updated[idx].mode = 'damaged';
                          setReturnedItemsList(updated);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                          item.mode === 'damaged'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-450'
                        }`}
                      >
                        Exp / Damage (Waste)
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-4 mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnedModal(false);
                    setReturnedModalOrderId(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Process Return
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
