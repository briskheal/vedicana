"use client";
import React, { useState, useEffect } from 'react';
import { Layout, Plus, Trash2, Loader, Sparkles, RefreshCw, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function AdminFooterLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState('policies');
  const [orderIndex, setOrderIndex] = useState('0');

  // Load footer links
  const loadLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/footer');
      if (!res.ok) throw new Error('Failed to retrieve footer links');
      const data = await res.json();
      setLinks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve footer links. PostgreSQL connection may be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  // Submit Handler (Create Link)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Please fill out Title and URL fields.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      url: url.trim(),
      section,
      order_index: parseInt(orderIndex, 10) || 0
    };

    try {
      const res = await fetch('/api/admin/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save footer link');
      }

      // Reset Form & reload listing
      setTitle('');
      setUrl('');
      setSection('policies');
      setOrderIndex('0');
      await loadLinks();
      alert('Footer link created successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving footer link.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Action Click
  const handleDelete = async (id, linkTitle) => {
    if (!confirm(`Are you sure you want to delete the footer link "${linkTitle}"?`)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/footer/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete footer link');

      await loadLinks();
      alert(`Footer link "${linkTitle}" deleted.`);
    } catch (err) {
      console.error(err);
      alert('Error deleting footer link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Group links by section
  const quickLinks = links.filter(link => link.section === 'quick_links');
  const policiesLinks = links.filter(link => link.section === 'policies');

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block"></span>
            Footer Page Navigation Management
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure quick links, privacy policies, terms, and custom URLs rendering in the site-wide footer.</p>
        </div>
        <button 
          onClick={loadLinks}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          <RefreshCw size={14} /> Refresh Links
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Footer Links Groups (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3 bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl">
              <Loader size={36} className="animate-spin text-vedicana-gold" />
              <span className="text-sm font-semibold">Loading footer configuration...</span>
            </div>
          ) : (
            <>
              {/* Quick Links Section */}
              <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links Section</h3>
                </div>
                {quickLinks.length === 0 ? (
                  <p className="p-6 text-slate-500 italic text-center">No Quick Links configured.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80 bg-slate-900/20">
                          <th className="px-4 py-2 font-medium">Link Title</th>
                          <th className="px-4 py-2 font-medium">Destination URL</th>
                          <th className="px-4 py-2 font-medium">Order Index</th>
                          <th className="px-4 py-2 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {quickLinks.map((link) => (
                          <tr key={link.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-2 font-semibold text-white">{link.title}</td>
                            <td className="px-4 py-2 font-mono text-xs text-slate-400">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-vedicana-gold inline-flex items-center gap-1.5">
                                {link.url} <ExternalLink size={11} />
                              </a>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-400">{link.order_index}</td>
                            <td className="px-4 py-2 text-right flex justify-end gap-2">
                              <button 
                                onClick={() => handleDelete(link.id, link.title)}
                                className="p-2 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-400"
                                title="Delete link"
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

              {/* Policies & Terms Section */}
              <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Policies & Conditions Section</h3>
                </div>
                {policiesLinks.length === 0 ? (
                  <p className="p-6 text-slate-500 italic text-center">No Policy Links configured.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80 bg-slate-900/20">
                          <th className="px-4 py-2 font-medium">Link Title</th>
                          <th className="px-4 py-2 font-medium">Destination URL</th>
                          <th className="px-4 py-2 font-medium">Order Index</th>
                          <th className="px-4 py-2 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {policiesLinks.map((link) => (
                          <tr key={link.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-2 font-semibold text-white">{link.title}</td>
                            <td className="px-4 py-2 font-mono text-xs text-slate-400">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-vedicana-gold inline-flex items-center gap-1.5">
                                {link.url} <ExternalLink size={11} />
                              </a>
                            </td>
                            <td className="px-4 py-2 font-mono text-slate-400">{link.order_index}</td>
                            <td className="px-4 py-2 text-right flex justify-end gap-2">
                              <button 
                                onClick={() => handleDelete(link.id, link.title)}
                                className="p-2 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-400"
                                title="Delete link"
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
            </>
          )}

        </div>

        {/* Right Side: Add Link Form (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <LinkIcon className="text-vedicana-green" size={16} />
                Inject Footer Link
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Link Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Link Label *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Privacy Policy"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                  required
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination URL *</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /privacy-policy"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>

              {/* Section Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Footer Section Column</label>
                <select 
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm cursor-pointer"
                >
                  <option value="quick_links">Quick Links</option>
                  <option value="policies">Policies & Support</option>
                </select>
              </div>

              {/* Order Index */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordering Index (Positional)</label>
                <input 
                  type="number" 
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Link
              </button>
            </form>

            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 text-xs leading-relaxed text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-widest flex items-center gap-1"><Sparkles size={12} className="text-vedicana-gold" /> System Guidelines</span>
              <p>Quick links render in the first sidebar column of the public footer.</p>
              <p>Policies and legal conditions render in the second sidebar column.</p>
              <p>You can define relative paths (like <code>/refund-policy</code>) or absolute URLs (like <code>https://razorpay.com/...</code>).</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
