"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Award, Plus, Trash2, Loader, Sparkles, RefreshCw, X } from 'lucide-react';

export default function AdminCertifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Load certifications from API
  const loadCertifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/certifications');
      if (!res.ok) throw new Error('Failed to fetch certifications');
      const data = await res.json();
      setCertifications(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve quality stamps from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCertifications();
  }, []);

  // In-browser WebP compressor and resizer to 120x120 stamp size
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size is too large. Keep it under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'certifications');

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

  // Submit Handler (Add certification stamp)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Certification title is required.');
      return;
    }
    if (!imageBase64) {
      alert('Please upload a stamp icon file.');
      return;
    }

    if (certifications.length >= 9) {
      alert('A maximum of 9 stamps can be displayed in this block. Please delete an existing stamp first.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      image: imageBase64,
      order_index: orderIndex
    };

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save stamp');
      }

      // Reset form
      setTitle('');
      setOrderIndex(certifications.length + 2); // default next order
      setImageBase64('');
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadCertifications();
      alert('Quality Stamp added successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving quality stamp.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id, stampTitle) => {
    if (!confirm(`Are you sure you want to delete "${stampTitle}" stamp?`)) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/certifications/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete stamp');

      await loadCertifications();
      alert('Stamp deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Error occurred while deleting stamp.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block"></span>
            High Quality Certifications Stamps
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage stamp size credentials displayed in the storefront &ldquo;High Quality&rdquo; column. The system strictly caps the maximum active certifications at exactly 9 to preserve the elegant 3x3 layout design.</p>
        </div>
        <button 
          onClick={loadCertifications}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          <RefreshCw size={14} /> Refresh Stamps
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Stamps Grid (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
              <h3 className="text-sm uppercase tracking-wider text-slate-450 font-bold flex items-center gap-2">
                <Award className="text-vedicana-gold" size={16} />
                Seeded Stamp Slots ({certifications.length} of 9 filled)
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                certifications.length >= 9 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-vedicana-green/20 text-vedicana-green border border-vedicana-green/30'
              }`}>
                {certifications.length >= 9 ? 'Grid Full' : 'Slots Available'}
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader size={36} className="animate-spin text-vedicana-gold" />
                <span className="text-sm font-semibold">Loading quality stamps...</span>
              </div>
            ) : certifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <p className="text-base font-serif text-slate-400">No active certification stamps found.</p>
                <p className="text-xs text-slate-500">The public store is operating under default hardcoded fallback stamps.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <div key={cert.id} className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 flex flex-col items-center justify-between text-center relative group shadow-sm hover:shadow-md hover:border-slate-700/80 transition-all">
                    
                    {/* Delete button (absolute top right, visible on hover or always) */}
                    <button
                      onClick={() => handleDelete(cert.id, cert.title)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-slate-500 hover:text-red-400 hover:bg-slate-800 border border-slate-850 rounded-lg cursor-pointer transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete stamp slot"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Stamp Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-white p-2 border border-slate-800 flex items-center justify-center shadow-sm overflow-hidden mb-4">
                      <img 
                        src={cert.image} 
                        alt={cert.title} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('bg-[#eaf4e6]');
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-serif font-bold text-white leading-tight">{cert.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Weight Index: {cert.order_index}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Sparkles size={16} className="text-vedicana-gold" />
              High Quality Stamp Design Guidelines
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong className="text-slate-300">Design Consistency:</strong> To maintain perfect storefront grid symmetry, the homepage displays stamps in a 3x3 layout. The database restricts registrations to strictly 9 maximum stamps to ensure perfect typography layout rendering.
              </p>
              <p>
                <strong className="text-slate-300">Client-Side Canvas Compressor:</strong> The file uploader utilizes an in-browser HTML5 canvas element to proportionally scale and crop uploaded stamps to exactly 120x120 pixels, compressing them to dynamic .webp strings for rapid mobile landing loads.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Creator (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Plus className="text-vedicana-green" size={16} />
                Inject Quality Stamp
              </h3>
            </div>

            {certifications.length >= 9 ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-xs leading-relaxed">
                <strong className="block font-bold mb-1 uppercase tracking-wide">9 of 9 Slots Filled</strong>
                You have reached the maximum stamp slots limit allowed. Please delete one of the existing stamps from the left panel to free up a slot.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Stamp File Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Stamp Icon File *
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-square bg-white p-6 max-w-[150px] mx-auto shadow-inner group">
                      <img 
                        src={imagePreview} 
                        alt="Stamp Preview" 
                        className="w-full h-full object-contain"
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
                          title="Remove Icon"
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
                      <Award className="text-slate-500 group-hover:text-vedicana-gold transition-colors mb-2" size={32} />
                      <span className="text-xs text-slate-400 font-semibold block">Click to upload stamp</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">JPG, PNG or WEBP (auto-compressed)</span>
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

                {/* Stamp Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stamp Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. WHO GMP"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                    required
                  />
                </div>

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

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
                >
                  {saving ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Stamp
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
