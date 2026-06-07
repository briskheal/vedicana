"use client";
import React, { useState, useEffect } from 'react';
import { Layers, Edit2, Trash2, Plus, X, Loader, Sparkles, RefreshCw } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  
  // Edit mode tracking
  const [editingId, setEditingId] = useState(null);

  // Load categories list from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to retrieve categories');
      const data = await res.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve categories. PostgreSQL connection might be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-generate slug from name in Create Mode
  useEffect(() => {
    if (autoSlug && !editingId) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated);
    }
  }, [name, autoSlug, editingId]);

  // Handle Edit Action Click
  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setAutoSlug(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setAutoSlug(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug: slug.trim()
    };

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      // Reset Form & reload listing
      handleCancelEdit();
      await loadCategories();
      alert(editingId ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving category.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Action Click
  const handleDelete = async (id, title, count) => {
    let warningMsg = `Are you absolutely sure you want to delete "${title}"?`;
    if (count > 0) {
      warningMsg = `WARNING: Category "${title}" currently contains ${count} active product(s)!\n\nDeleting this category will unlink those products (marking them as uncategorized). Do you still want to proceed?`;
    }

    if (!confirm(warningMsg)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete category');

      await loadCategories();
      alert(`Category "${title}" has been deleted.`);
    } catch (err) {
      console.error(err);
      alert('Error deleting category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block"></span>
            Category Logistics Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage catalog classifications, customize URLs, and organize the website dropdown folders dynamically.</p>
        </div>
        <button 
          onClick={loadCategories}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          <RefreshCw size={14} /> Refresh Categories
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Categories Table (2/3 width) */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden h-fit">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader size={36} className="animate-spin text-vedicana-gold" />
              <span className="text-sm font-semibold">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <p className="text-base font-serif text-slate-400">No categories found in the database.</p>
              <p className="text-xs text-slate-650">Please create a category using the form on the right.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Category Name</th>
                    <th className="px-6 py-4 font-medium">Url Slug</th>
                    <th className="px-6 py-4 font-medium">Active Products</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500">{cat.id}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white leading-tight font-serif text-base">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-900 px-2.5 py-1.5 rounded text-xs border border-slate-850 font-mono text-slate-400">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-400 font-mono">
                          {cat.productCount} Items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-400">
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="p-2 hover:text-vedicana-gold hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit category slug"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name, cat.productCount)}
                          className="p-2 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Delete category"
                          disabled={saving}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Form Creator/Modifier (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Layers className="text-vedicana-green" size={16} />
                {editingId ? 'Modify Category' : 'Create New Category'}
              </h3>
              {editingId && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  title="Cancel editing"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Saffron & Honey"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                  required
                />
              </div>

              {/* Url Slug */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Url Slug path</label>
                  {!editingId && (
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 focus:ring-0 w-3 h-3 cursor-pointer"
                      />
                      Auto-Sync
                    </label>
                  )}
                </div>
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  placeholder="e.g. saffron-honey"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : editingId ? <Save size={14} /> : <Plus size={14} />}
                {editingId ? 'Apply Changes' : 'Inject Category'}
              </button>
            </form>

            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 text-xs leading-relaxed text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-widest flex items-center gap-1"><Sparkles size={12} className="text-vedicana-gold" /> System Guidelines</span>
              <p>Adding a category here instantly lists it under the shop sidebar page and global header navigation dropdown.</p>
              <p>If you edit a category's URL slug, any existing links mapping to it must be updated (e.g. products filtering).</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
