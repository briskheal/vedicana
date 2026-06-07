"use client";
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Search, Filter, RefreshCw, Plus, Loader, 
  Trash2, FileText, ArrowRight, ShieldCheck, HelpCircle, Layers, ClipboardList
} from 'lucide-react';

export default function ExpiredDamagedInventory() {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Damage');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load Damaged Stock Logs
      const logsRes = await fetch('/api/admin/inventory');
      if (!logsRes.ok) throw new Error('Failed to load inventory logs');
      const logsData = await logsRes.json();
      setLogs(logsData);

      // 2. Load Products Catalog for select dropdown
      const prodRes = await fetch('/api/admin/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve audit logs. PostgreSQL database connection may be inactive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Parse variants for selected product
  const getSelectedProductVariants = () => {
    if (!selectedProductId) return [];
    const product = products.find(p => p.id === parseInt(selectedProductId, 10));
    if (!product) return [];

    try {
      const addInfo = typeof product.additional_info === 'string'
        ? JSON.parse(product.additional_info)
        : product.additional_info;
      
      if (addInfo?.variants && Array.isArray(addInfo.variants)) {
        return addInfo.variants.map(v => v.size);
      } else {
        const variantStr = addInfo?.Variant || addInfo?.variant || '';
        return variantStr.split(',').map(v => v.trim()).filter(Boolean);
      }
    } catch (e) {
      console.error('Error parsing product variants:', e);
      return [];
    }
  };

  const handleProductChange = (productIdVal) => {
    setSelectedProductId(productIdVal);
    setSelectedVariant(''); // Reset variant when product changes
  };

  const handleSubmitWriteoff = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Please select a product.');
      return;
    }
    const qtyInt = parseInt(quantity, 10);
    if (isNaN(qtyInt) || qtyInt <= 0) {
      alert('Quantity must be a positive integer.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      productId: parseInt(selectedProductId, 10),
      variant: selectedVariant || null,
      quantity: qtyInt,
      reason
    };

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit write-off');
      }

      // Reset form & reload
      setSelectedProductId('');
      setSelectedVariant('');
      setQuantity('1');
      setReason('Damage');
      await loadData();
      alert('Manual warehouse stock write-off submitted successfully. Primary catalog stock level decremented.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving write-off.');
    } finally {
      setSaving(false);
    }
  };

  // Filter logs logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.productId.toString().includes(searchQuery) ||
      (log.variant || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Returned') {
      return matchesSearch && log.reason.toLowerCase().includes('returned');
    }
    if (activeFilter === 'Manual') {
      return matchesSearch && !log.reason.toLowerCase().includes('returned');
    }
    return matchesSearch;
  });

  // Calculate quick metrics
  const totalWriteoffUnits = logs.reduce((acc, log) => acc + log.quantity, 0);
  const totalReturnedUnits = logs.filter(log => log.reason.toLowerCase().includes('returned')).reduce((acc, log) => acc + log.quantity, 0);
  const totalManualUnits = logs.filter(log => !log.reason.toLowerCase().includes('returned')).reduce((acc, log) => acc + log.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm animate-fadeIn">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-red-500 w-2 h-8 rounded-full inline-block animate-pulse"></span>
            Expired & Damaged Stock Audit
          </h2>
          <p className="text-slate-400 text-sm mt-1">Audit returned expired/damaged items from customer orders and log manual warehouse write-offs to keep inventory level sync.</p>
        </div>
        <button 
          onClick={loadData}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Ledger
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Total Write-off Units</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalWriteoffUnits}</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Order Returns Waste</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalReturnedUnits}</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Manual Write-offs</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalManualUnits}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Audit Trail Logs (8/12 cols) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col h-full">
          
          {/* Filters Bar */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Product name, ID or mode..." 
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-slate-700 text-xs font-medium"
              />
            </div>
            
            <div className="flex gap-2">
              {['All', 'Returned', 'Manual'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden flex-1">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader size={36} className="animate-spin text-red-500" />
                <span className="text-sm">Fetching audit trail logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <p className="text-base font-serif text-slate-400">No damaged stock logs matched filters</p>
                <p className="text-xs text-slate-600">Logs will appear when returns are marked as damaged, or manual warehouse write-offs are logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                      <th className="px-5 py-4 font-medium">Record ID</th>
                      <th className="px-5 py-4 font-medium">Product Details</th>
                      <th className="px-5 py-4 font-medium">Timestamp</th>
                      <th className="px-5 py-4 font-medium">Qty Wasted</th>
                      <th className="px-5 py-4 font-medium">Destination Reason</th>
                      <th className="px-5 py-4 font-medium text-right">Order Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-400">
                          #{log.id}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white text-xs">{log.productName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Product ID: <span className="font-mono">{log.productId}</span>
                            {log.variant && (
                              <span className="ml-2">
                                Variant: <span className="font-mono bg-slate-850 px-1.5 py-0.5 rounded text-vedicana-gold">{log.variant}</span>
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono text-[10px]">
                          {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="text-slate-600 block mt-0.5">
                            {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-200 font-bold">
                          {log.quantity} units
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            log.reason.toLowerCase().includes('returned')
                              ? 'bg-orange-500/10 text-orange-400'
                              : log.reason.toLowerCase() === 'expired'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {log.reason}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {log.orderId ? (
                            <a 
                              href="/admin/orders" 
                              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded font-medium text-[10px] border border-slate-700 transition-colors"
                              title="Go to Orders to inspect returned details"
                            >
                              Order #{log.orderId} <ArrowRight size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">Manual Writeoff</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Log Manual Write-off Form (4/12 cols) */}
        <div className="lg:col-span-4 bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500 animate-pulse" size={16} />
              Manual Write-off
            </h3>
          </div>

          <form onSubmit={handleSubmitWriteoff} className="space-y-4">
            
            {/* Select Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Product *</label>
              <select 
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs cursor-pointer"
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>

            {/* Select Variant */}
            {selectedProductId && getSelectedProductVariants().length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Variant / Size</label>
                <select 
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs cursor-pointer font-mono"
                >
                  <option value="">-- General / Base Product --</option>
                  {getSelectedProductVariants().map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity to Write-off *</label>
              <input 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs font-mono"
                required
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Write-off Destination *</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs cursor-pointer"
                required
              >
                <option value="Damage">Warehouse Damage</option>
                <option value="Expired">Product Expired</option>
              </select>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
              Log Write-off
            </button>
          </form>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed text-slate-400 space-y-2">
            <span className="font-bold text-slate-350 block uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12} className="text-red-400" /> Operational Safeguard</span>
            <p>1. Manual warehouse write-offs will directly **decrement** the main product catalog stock level.</p>
            <p>2. To reverse mistakes, you must edit the product stock level manually in the catalog editor.</p>
            <p>3. This inventory write-off logs database entries for audit history trails.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
