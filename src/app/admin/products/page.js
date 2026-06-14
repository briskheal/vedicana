"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, RefreshCw, Upload, Loader, Eye, EyeOff } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load products and categories from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch catalog data');
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve catalog. PostgreSQL database connection may be inactive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you absolutely sure you want to delete "${title}"? This will permanently delete the product, its gallery, and all associated customer reviews!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete product');
      
      setProducts(products.filter(p => p.id !== id));
      alert(`Product "${title}" has been deleted successfully.`);
    } catch (err) {
      console.error(err);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleToggleActive = async (id, currentState, title) => {
    const newState = !currentState;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newState }),
      });
      if (!res.ok) throw new Error('Failed to update product visibility');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: newState } : p));
    } catch (err) {
      console.error(err);
      alert('Error updating product visibility. Please try again.');
    }
  };

  const handleToggleFeatured = async (id, currentState) => {
    const newState = !currentState;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: newState }),
      });
      if (!res.ok) throw new Error('Failed to update product featured status');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: newState } : p));
    } catch (err) {
      console.error(err);
      alert('Error updating featured status. Please try again.');
    }
  };

  // Filter & Search Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toString().includes(searchQuery) ||
      (product.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && product.CategoryId === parseInt(selectedCategory, 10);
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block animate-pulse"></span>
            Product Logistics Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1">Direct CRUD dashboard. Customize description tables, add up to 4 photograph slots, configure custom GST percentages, and manage stock.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <a 
            href="/admin/products/edit/new" 
            className="bg-vedicana-green hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-wider"
          >
            <Plus size={14} /> Inject New Product
          </a>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Title, ID, or slug path..." 
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green transition-all placeholder-slate-700 text-sm"
          />
        </div>
        
        {/* Category Selector Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex-shrink-0">Filter Category:</span>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader size={36} className="animate-spin text-vedicana-gold" />
            <span className="text-sm font-semibold">Loading catalog details...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-serif text-slate-400">No products found matching filters</p>
            <p className="text-xs text-slate-600">Please click the 'Inject New Product' button to add a remedy manually.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                  <th className="px-4 py-2 font-medium">Product Details</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Pricing</th>
                  <th className="px-4 py-2 font-medium">Tax Details</th>
                  <th className="px-4 py-2 font-medium">Stock Level</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 p-0.5 overflow-hidden flex-shrink-0 relative group-hover:border-vedicana-green transition-colors">
                          <img 
                            src={product.image || 'https://via.placeholder.com/100?text=No+Image'} 
                            alt={product.title} 
                            className="w-full h-full object-contain rounded-md" 
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{product.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">Slug: /{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="bg-slate-900 text-slate-400 px-2.5 py-1.5 rounded-lg text-xs border border-slate-850 font-medium">
                        {product.Category ? product.Category.name : 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-300">
                      {product.sale_price ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-white">₹{parseFloat(product.sale_price).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-500 line-through">₹{parseFloat(product.price).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-white">₹{parseFloat(product.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-400 font-mono">
                        GST: {product.tax_rate ?? 5}%
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 shadow-[0_0_5px_rgba(239,68,68,1)]'}`}></div>
                        <span className="text-slate-300 font-medium">{product.stock} Units</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                        className="transition-all hover:scale-105"
                        title={product.is_featured ? "Click to remove from Featured" : "Click to set as Featured"}
                      >
                        {product.is_featured ? (
                          <span className="bg-vedicana-gold/20 text-vedicana-gold border border-vedicana-gold/40 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:bg-vedicana-gold/30">Featured</span>
                        ) : (
                          <span className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide cursor-pointer">Standard</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end items-center gap-2 text-slate-400">
                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleActive(product.id, product.is_active, product.title)}
                          title={product.is_active !== false ? 'Visible on website — click to hide' : 'Hidden from website — click to show'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            product.is_active !== false
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                              : 'bg-slate-700/60 text-slate-500 hover:bg-slate-700 border border-slate-600'
                          }`}
                        >
                          {product.is_active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          {product.is_active !== false ? 'Live' : 'Hidden'}
                        </button>
                        <a 
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 hover:text-vedicana-gold hover:bg-slate-800 rounded transition-colors"
                          title="Edit dynamic parameters"
                        >
                          <Edit2 size={16} />
                        </a>
                        <button 
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-2 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Delete product permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
