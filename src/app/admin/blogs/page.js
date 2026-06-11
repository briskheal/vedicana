'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Eye, Calendar, Clock, Star,
  RefreshCw, Send, Save, X, Tag, User, BookOpen, TrendingUp,
  ChevronDown, Bold, Italic, Heading, List, Link as LinkIcon,
  AlertCircle, CheckCircle
} from 'lucide-react';

const CATEGORIES = ['Wellness', 'Ayurveda', 'Recipes', 'Lifestyle', 'Product News'];

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: 'bg-slate-700', text: 'text-slate-300', dot: 'bg-slate-400' },
  published: { label: 'Published', bg: 'bg-green-900/60', text: 'text-green-400', dot: 'bg-green-400' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-900/60', text: 'text-blue-400', dot: 'bg-blue-400' },
};

const CATEGORY_COLORS = {
  Wellness: 'text-emerald-400',
  Ayurveda: 'text-amber-400',
  Recipes: 'text-orange-400',
  Lifestyle: 'text-purple-400',
  'Product News': 'text-sky-400',
};

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: 'VediCana Team',
  category: 'Wellness',
  tags: '',
  status: 'draft',
  scheduled_at: '',
  read_time: 5,
  is_featured: false,
};

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [slugManual, setSlugManual] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm(f => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugManual]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSlugManual(false);
    setPanelOpen(true);
  };

  const openEdit = (blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      cover_image: blog.cover_image || '',
      author: blog.author || 'VediCana Team',
      category: blog.category || 'Wellness',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      status: blog.status || 'draft',
      scheduled_at: blog.scheduled_at ? blog.scheduled_at.substring(0, 16) : '',
      read_time: blog.read_time || 5,
      is_featured: blog.is_featured || false,
    });
    setSlugManual(true);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSlugManual(false);
  };

  const getPayload = (statusOverride) => ({
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt || null,
    content: form.content || null,
    cover_image: form.cover_image || null,
    author: form.author || 'VediCana Team',
    category: form.category,
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    status: statusOverride || form.status,
    scheduled_at: form.status === 'scheduled' ? form.scheduled_at || null : null,
    read_time: parseInt(form.read_time) || 5,
    is_featured: form.is_featured,
  });

  const saveBlog = async (statusOverride) => {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = getPayload(statusOverride);
      let res;
      if (editingId) {
        res = await fetch(`/api/admin/blogs/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/blogs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Save failed', 'error');
        return;
      }
      showToast(editingId ? 'Blog updated!' : 'Blog created!', 'success');
      closePanel();
      fetchBlogs();
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (blog) => {
    try {
      await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !blog.is_featured }),
      });
      fetchBlogs();
    } catch { showToast('Failed to toggle featured', 'error'); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/blogs/${deleteId}`, { method: 'DELETE' });
      if (res.ok) { showToast('Blog deleted'); fetchBlogs(); }
      else showToast('Delete failed', 'error');
    } catch { showToast('Network error', 'error'); }
    setDeleteId(null);
  };

  // Toolbar insert helpers
  const insertMarkdown = (before, after = '') => {
    const ta = document.getElementById('blog-content-ta');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    const newContent =
      form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    setForm(f => ({ ...f, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Stats
  const total = blogs.length;
  const published = blogs.filter(b => b.status === 'published').length;
  const drafts = blogs.filter(b => b.status === 'draft').length;
  const scheduled = blogs.filter(b => b.status === 'scheduled').length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <div className="min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border transition-all animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'error'
            ? 'bg-red-950 border-red-800 text-red-300'
            : 'bg-emerald-950 border-emerald-800 text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete Blog Post?</h3>
                <p className="text-slate-400 text-xs">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold transition-colors text-sm cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-vedicana-green/20 border border-vedicana-green/30 flex items-center justify-center">
              <FileText size={18} className="text-vedicana-green" />
            </span>
            Blog Posts
          </h1>
          <p className="text-slate-400 text-sm mt-1">Create, manage and publish your wellness content</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchBlogs} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vedicana-green hover:bg-vedicana-green/80 text-white font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-vedicana-green/20">
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Posts', value: total, icon: FileText, color: 'text-slate-300' },
          { label: 'Published', value: published, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Drafts', value: drafts, icon: Save, color: 'text-slate-400' },
          { label: 'Scheduled', value: scheduled, icon: Calendar, color: 'text-blue-400' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: TrendingUp, color: 'text-vedicana-gold' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Main Content + Slide Panel Layout */}
      <div className="flex gap-6 relative">
        {/* Blog List Table */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${panelOpen ? 'hidden lg:block' : ''}`}>
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                <RefreshCw size={24} className="animate-spin mr-3" /> Loading blogs...
              </div>
            ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <FileText size={40} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No blog posts yet</p>
                <p className="text-sm mt-1">Click "New Post" to create your first article</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="text-left px-5 py-4 font-semibold">Title</th>
                      <th className="text-left px-4 py-4 font-semibold">Status</th>
                      <th className="text-left px-4 py-4 font-semibold hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-4 font-semibold hidden lg:table-cell">Author</th>
                      <th className="text-left px-4 py-4 font-semibold hidden xl:table-cell">Date</th>
                      <th className="text-center px-4 py-4 font-semibold hidden md:table-cell">Views</th>
                      <th className="text-center px-4 py-4 font-semibold">Featured</th>
                      <th className="text-right px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {blogs.map((blog) => {
                      const sc = STATUS_CONFIG[blog.status] || STATUS_CONFIG.draft;
                      return (
                        <tr key={blog.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-white text-sm leading-tight line-clamp-1 max-w-xs">
                              {blog.title}
                            </div>
                            {blog.excerpt && (
                              <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-xs">{blog.excerpt}</div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <span className={`text-xs font-semibold ${CATEGORY_COLORS[blog.category] || 'text-slate-400'}`}>
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-vedicana-green/20 text-vedicana-green text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {(blog.author || 'V')[0].toUpperCase()}
                              </div>
                              <span className="text-slate-400 text-xs truncate max-w-[100px]">{blog.author}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden xl:table-cell text-slate-400 text-xs">
                            {blog.status === 'scheduled'
                              ? <span className="text-blue-400 flex items-center gap-1"><Calendar size={11} /> {formatDate(blog.scheduled_at)}</span>
                              : formatDate(blog.published_at || blog.createdAt)}
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell text-center">
                            <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                              <Eye size={11} /> {blog.views || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleFeatured(blog)}
                              title={blog.is_featured ? 'Remove featured' : 'Mark featured'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${blog.is_featured ? 'text-vedicana-gold bg-vedicana-gold/10' : 'text-slate-600 hover:text-vedicana-gold hover:bg-vedicana-gold/10'}`}
                            >
                              <Star size={14} fill={blog.is_featured ? 'currentColor' : 'none'} />
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(blog)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-vedicana-green hover:bg-vedicana-green/10 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteId(blog.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Slide-in Editor Panel */}
        {panelOpen && (
          <div className="w-full lg:w-[52%] flex-shrink-0 bg-[#1e293b] border border-slate-700 rounded-2xl flex flex-col h-[calc(100vh-220px)] shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <Edit2 size={16} className="text-vedicana-green" />
                {editingId ? 'Edit Post' : 'New Post'}
              </h2>
              <button onClick={closePanel} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="Your blog post title..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Slug</label>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); setForm(f => ({ ...f, slug: e.target.value })); }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm font-mono"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="Short summary shown on the blog listing page..."
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm resize-none"
                />
              </div>

              {/* Content with toolbar */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Content</label>
                {/* Toolbar */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 border-b-0 rounded-t-lg px-3 py-2">
                  {[
                    { icon: Bold, action: () => insertMarkdown('**', '**'), tip: 'Bold' },
                    { icon: Italic, action: () => insertMarkdown('*', '*'), tip: 'Italic' },
                    { icon: Heading, action: () => insertMarkdown('## '), tip: 'Heading' },
                    { icon: List, action: () => insertMarkdown('- '), tip: 'Bullet List' },
                    { icon: LinkIcon, action: () => insertMarkdown('[', '](url)'), tip: 'Link' },
                  ].map(({ icon: Icon, action, tip }) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={action}
                      title={tip}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                  <span className="text-slate-700 text-xs ml-2">Markdown supported</span>
                </div>
                <textarea
                  id="blog-content-ta"
                  rows={10}
                  placeholder="Write your blog content here... Markdown is supported."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-b-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm font-mono resize-y"
                />
              </div>

              {/* Two columns: Author + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                    <User size={11} /> Author
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                    <BookOpen size={11} /> Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-vedicana-green transition-colors text-sm cursor-pointer appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                  <Tag size={11} /> Tags <span className="text-slate-600 normal-case">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="ayurveda, wellness, herbs, ..."
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.cover_image}
                  onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                />
                {form.cover_image && (
                  <div className="mt-2 rounded-lg overflow-hidden h-24 border border-slate-700">
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              {/* Status + Scheduled At */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-vedicana-green transition-colors text-sm cursor-pointer appearance-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                    <Clock size={11} /> Read Time (min)
                  </label>
                  <input
                    type="number"
                    min={1} max={60}
                    value={form.read_time}
                    onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Scheduled At (conditional) */}
              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                    <Calendar size={11} /> Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-vedicana-green transition-colors text-sm"
                  />
                </div>
              )}

              {/* Featured Toggle */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
                <div>
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <Star size={14} className="text-vedicana-gold" /> Featured Post
                  </span>
                  <span className="text-slate-500 text-xs">Show prominently at the top of the blog page</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.is_featured ? 'bg-vedicana-gold' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-800 flex-shrink-0">
              <button
                onClick={() => saveBlog('draft')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                <Save size={14} /> Save Draft
              </button>
              <button
                onClick={() => saveBlog('published')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-vedicana-green hover:bg-vedicana-green/80 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-lg shadow-vedicana-green/20"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {saving ? 'Saving...' : 'Publish Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
