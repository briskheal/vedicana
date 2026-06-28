"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Edit2, Trash2, Plus, X, Loader, Sparkles, RefreshCw, ExternalLink, Check, Save } from 'lucide-react';

export default function AdminBanners() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [link, setLink] = useState('/shop');
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  // Image tracking
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  // Edit mode tracking
  const [editingId, setEditingId] = useState(null);

  // Load slides from PostgreSQL API
  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/hero-slides');
      if (!res.ok) throw new Error('Failed to retrieve hero slides');
      const data = await res.json();
      setSlides(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve banners. Database may be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSlides();
  }, []);

  // Handle image upload via API endpoint to Supabase CDN
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image is too large. Please upload an image under 8MB.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'banners');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageBase64(data.url);
        setImagePreview(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image');
    }
  };

  // Handle Edit Action Click
  const handleEditClick = (slide) => {
    setEditingId(slide.id);
    setTitle(slide.title || '');
    setSubtitle(slide.subtitle || '');
    setBadge(slide.badge || '');
    setLink(slide.link || '/shop');
    setOrderIndex(slide.order_index);
    setIsActive(slide.is_active);
    setImageBase64(''); // Keep empty if we are not changing the image
    setImagePreview(slide.image); // Display current slide image
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setBadge('');
    setLink('/shop');
    setOrderIndex(0);
    setIsActive(true);
    setImageBase64('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !imageBase64) {
      alert('Please upload a hero banner image.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      subtitle,
      badge,
      link,
      order_index: orderIndex,
      is_active: isActive
    };

    if (imageBase64) {
      payload.image = imageBase64;
    }

    try {
      const url = editingId ? `/api/admin/hero-slides/${editingId}` : '/api/admin/hero-slides';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save slide');
      }

      // Reset Form & reload listing
      handleCancelEdit();
      await loadSlides();
      alert(editingId ? 'Banner updated successfully!' : 'Banner created successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving hero slide.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (slide) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !slide.is_active })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadSlides();
    } catch (err) {
      console.error(err);
      alert('Error updating slide status.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Action Click
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you absolutely sure you want to delete this hero banner slide?`)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete slide');

      await loadSlides();
      alert('Hero banner slide deleted.');
    } catch (err) {
      console.error(err);
      alert('Error deleting hero slide. Please try again.');
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
            Hero Banner Slider Command Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage landing page storefront hero carousels. Images are compressed client-side to highly optimized WebP format for rapid rendering.</p>
        </div>
        <button 
          onClick={loadSlides}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          <RefreshCw size={14} /> Refresh Banners
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Banners Listing (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader size={36} className="animate-spin text-vedicana-gold" />
                <span className="text-sm font-semibold">Loading banners database...</span>
              </div>
            ) : slides.length === 0 ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <p className="text-base font-serif text-slate-400">No custom hero slides registered yet.</p>
                <p className="text-xs text-slate-500">The public store is currently operating under default WordPress seeds fallback slides.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900/60 text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                      <th className="px-4 py-2 font-medium w-16">Sort</th>
                      <th className="px-4 py-2 font-medium w-48">Image Preview</th>
                      <th className="px-4 py-2 font-medium">Text Overlays</th>
                      <th className="px-4 py-2 font-medium w-24">Status</th>
                      <th className="px-4 py-2 font-medium text-right w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {slides.map((slide) => (
                      <tr key={slide.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-4 py-2 font-mono font-bold text-vedicana-gold text-base">
                          {slide.order_index}
                        </td>
                        <td className="px-4 py-2">
                          <div className="relative w-40 h-16 rounded overflow-hidden border border-slate-700 bg-slate-900 shadow">
                            <img 
                              src={slide.image} 
                              alt={slide.title || "Slide banner"} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400";
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 space-y-1">
                          <div className="flex items-center gap-2">
                            {slide.badge && (
                              <span className="bg-vedicana-gold/10 text-vedicana-gold text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-vedicana-gold/20">
                                {slide.badge}
                              </span>
                            )}
                            <span className="font-semibold text-white leading-tight font-serif text-base">
                              {slide.title || <span className="text-slate-500 italic text-sm">No Title</span>}
                            </span>
                          </div>
                          {slide.subtitle && <p className="text-slate-400 text-xs">{slide.subtitle}</p>}
                          <a 
                            href={slide.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-vedicana-green hover:underline"
                          >
                            <ExternalLink size={10} /> {slide.link}
                          </a>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleToggleActive(slide)}
                            disabled={saving}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                              slide.is_active 
                                ? 'bg-vedicana-green/10 text-vedicana-green border-vedicana-green/30 hover:bg-vedicana-green/20' 
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {slide.is_active ? <Check size={12} /> : <X size={12} />}
                            {slide.is_active ? 'Active' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2 text-slate-400">
                            <button 
                              onClick={() => handleEditClick(slide)}
                              className="p-2 hover:text-vedicana-gold hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Edit hero slide details"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDelete(slide.id, slide.title)}
                              className="p-2 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Delete slide"
                              disabled={saving}
                            >
                              <Trash2 size={15} />
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

          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Sparkles size={16} className="text-vedicana-gold animate-pulse" />
              Storefront Hero Banner Style & Design Guidelines
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong className="text-slate-300">Edge-to-Edge Layout:</strong> The storefront slider runs in 100% viewport width matching the live layout of <code className="text-vedicana-gold font-mono text-[11px]">vedicana.com</code>. There are no container cards, gaps, margins, or rounded corners.
              </p>
              <p>
                <strong className="text-slate-300">Clean Banners Rule:</strong> Original brand banners already have rich, embedded calligraphy, headings, and CTA button artwork designed into them. If your uploaded image already contains typography, keep the <strong className="text-slate-300">Title, Subtitle, and Badge empty</strong> in this form to prevent superimposed textual double overlays.
              </p>
              <p>
                <strong className="text-slate-300">Optimized Uploads:</strong> Ideal slide aspect ratio is 16:9 or custom banner sizes (e.g. 1920x800). The client-side engine automatically crops/resizes and encodes files to high-efficiency WebP base64 so you do not have to worry about large file formats slowing down page load times.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Creator/Modifier (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <ImageIcon className="text-vedicana-green" size={16} />
                {editingId ? 'Modify Hero Slide' : 'Design New Hero Slide'}
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
              
              {/* Image Upload Block */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Banner Image *
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-[21/9] bg-slate-900 shadow-inner group">
                    <img 
                      src={imagePreview} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageBase64('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer transition-colors"
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-vedicana-green/50 bg-slate-900 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-850 transition-all group"
                  >
                    <ImageIcon className="text-slate-500 group-hover:text-vedicana-gold transition-colors mb-2" size={32} />
                    <span className="text-xs text-slate-400 font-semibold block">Click to upload banner file</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">JPG, PNG or WEBP (rescaled automatically)</span>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Title Overlay */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Title Text (Optional)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pure Stevia Drops"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                />
              </div>

              {/* Subtitle Overlay */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Subtitle Overlay (Optional)</label>
                <input 
                  type="text" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 100% Natural Sweetener"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                />
              </div>

              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Badge Tag (Optional)</label>
                <input 
                  type="text" 
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Premium Quality"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                />
              </div>

              {/* Redirection Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Action Target Link *</label>
                <input 
                  type="text" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/shop or custom url"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sort Order Index */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sort Weight</label>
                  <input 
                    type="number" 
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                    required
                  />
                </div>

                {/* Is Active Checkbox */}
                <div className="space-y-1.5 flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 focus:ring-vedicana-green text-vedicana-green w-4 h-4 cursor-pointer"
                    />
                    Publish Live
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : editingId ? <Save size={14} /> : <Plus size={14} />}
                {editingId ? 'Save Slide Alterations' : 'Inject Custom Banner'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
