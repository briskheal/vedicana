"use client";
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, ArrowRight, Loader } from 'lucide-react';

export default function DiscoverDashboard() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load custom pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/discover?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Failed to load Discover pages');
      const data = await res.json();
      setPages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve Discover pages. Please ensure database connection is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (slug, title) => {
    if (!confirm(`Are you absolutely sure you want to delete the page "${title}"? This action is permanent!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/discover/${slug}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete page');
      
      // Update local state
      setPages(pages.filter(page => page.slug !== slug));
      alert(`Page "${title}" has been deleted successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to delete page. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold mb-1">Discover Pages CRUD</h1>
          <p className="text-slate-400 text-sm">Create, edit, delete, and manage Custom Discover Pages dynamically in PostgreSQL.</p>
        </div>
        <a 
          href="/admin/discover/edit/new" 
          className="inline-flex items-center gap-2 bg-vedicana-green hover:bg-emerald-700 text-white font-medium text-sm uppercase tracking-wide px-5 py-3 rounded-lg transition-all shadow-md hover:-translate-y-0.5"
        >
          <Plus size={18} /> Create Custom Page
        </a>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Pages Listing Grid/Table */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader size={36} className="animate-spin text-vedicana-gold" />
            <span className="text-sm font-medium">Fetching custom pages...</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-serif">No Discover Pages Found</p>
            <p className="text-sm text-slate-600">Please run the seeder script or create a custom page using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-300 font-semibold tracking-wide uppercase text-xs">
                  <th className="p-4">ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Slug / Route Path</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-500">{page.id}</td>
                    <td className="p-4 font-serif text-white text-base font-semibold">{page.title}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      <span className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800/80">
                        /{page.slug}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        page.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${page.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                        {page.is_active ? 'Active / Visible' : 'Hidden / Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-mono">
                      {new Date(page.updatedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2.5">
                      <a 
                        href={`/${page.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded font-medium text-xs border border-slate-700 transition-colors"
                        title="Preview Live Page"
                      >
                        <Eye size={14} /> Preview
                      </a>
                      <a 
                        href={`/admin/discover/edit/${page.slug}`} 
                        className="inline-flex items-center gap-1.5 bg-vedicana-green/20 hover:bg-vedicana-green/35 text-emerald-400 px-3 py-1.5 rounded font-medium text-xs border border-vedicana-green/30 transition-colors"
                        title="Edit Page Content"
                      >
                        <Edit size={14} /> Edit
                      </a>
                      <button 
                        onClick={() => handleDelete(page.slug, page.title)}
                        className="inline-flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3 py-1.5 rounded font-medium text-xs border border-red-500/30 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
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
