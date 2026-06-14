"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Loader, Eye, RefreshCw, Upload, Sparkles, Pencil, X, Save } from 'lucide-react';

export default function AdminPopularCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shape, setShape] = useState('round'); // 'round' or 'square'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editId, setEditId] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/popular-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        throw new Error('Failed to fetch popular categories');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create quick temporary object URL for form preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Browser canvas optimization to crop and resize to exactly 112x112 px (Retina 56x56 px w-14 h-14)
  const cropAndOptimizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const TARGET_SIZE = 112; // 112px is perfect for w-14 h-14 display (56px) on Retina/high-res screens
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          
          const ctx = canvas.getContext('2d');
          
          // Crop square from the center of the image
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);
          
          // Export as WebP base64 data URL
          const webpDataUrl = canvas.toDataURL('image/webp', 0.95);
          resolve(webpDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please specify a category name.');
      return;
    }
    if (!editId && !imageFile) {
      alert('Please upload an image for the category.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Crop and optimize to WebP base64 if a new image was uploaded
      let optimizedImageBase64 = null;
      if (imageFile) {
        optimizedImageBase64 = await cropAndOptimizeImage(imageFile);
      }

      let res;
      if (editId) {
        res = await fetch(`/api/admin/popular-categories/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            shape,
            image: optimizedImageBase64
          })
        });
      } else {
        res = await fetch('/api/admin/popular-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            shape,
            image: optimizedImageBase64
          })
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to ${editId ? 'update' : 'create'} popular category`);
      }

      // Reset form
      setName('');
      setDescription('');
      setShape('round');
      setImageFile(null);
      setImagePreview('');
      setEditId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      alert(`Popular category ${editId ? 'updated' : 'created'} successfully!`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setName(cat.name);
    setDescription(cat.description || '');
    setShape(cat.shape || 'round');
    setImagePreview(cat.image);
    setImageFile(null);
    setEditId(cat.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const cancelEdit = () => {
    setName('');
    setDescription('');
    setShape('round');
    setImagePreview('');
    setImageFile(null);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Are you sure you want to delete "${catName}" from popular categories?`)) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(`/api/admin/popular-categories/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete popular category');
      }

      alert('Popular category deleted successfully!');
      fetchCategories();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <span className="bg-vedicana-green w-2 h-8 rounded-full inline-block"></span>
            Popular Categories Configuration
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure and style the popular categories displayed on the landing page.</p>
        </div>
        <button 
          onClick={fetchCategories}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Builder */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                {editId ? <Pencil className="text-vedicana-gold" size={16} /> : <Plus className="text-vedicana-green" size={16} />}
                {editId ? 'Edit Popular Category' : 'Add Popular Category'}
              </span>
              {editId && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded"
                >
                  <X size={10} /> Cancel
                </button>
              )}
            </h3>

            {/* Category Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wellness Remedies"
                className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none placeholder-slate-650"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Short Description</label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Immunity & health tonics"
                className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-2.5 px-3.5 text-xs text-white focus:outline-none placeholder-slate-650"
              />
            </div>

            {/* Shape Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Box Shape Style</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                  shape === 'round' 
                    ? 'bg-vedicana-green/20 border-vedicana-green text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input 
                    type="radio" 
                    name="shape" 
                    value="round" 
                    checked={shape === 'round'}
                    onChange={() => setShape('round')}
                    className="sr-only"
                  />
                  <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {shape === 'round' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span>Round (Circle)</span>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                  shape === 'square' 
                    ? 'bg-vedicana-green/20 border-vedicana-green text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <input 
                    type="radio" 
                    name="shape" 
                    value="square" 
                    checked={shape === 'square'}
                    onChange={() => setShape('square')}
                    className="sr-only"
                  />
                  <div className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center">
                    {shape === 'square' && <div className="w-1.5 h-1.5 bg-white"></div>}
                  </div>
                  <span>Square (Rounded Box)</span>
                </label>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category Icon Photo</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow transition-colors"
                >
                  <Upload size={14} /> Upload Icon
                </button>
                {imageFile && (
                  <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]">{imageFile.name}</span>
                )}
              </div>

              {/* Form Image Preview */}
              {imagePreview && (
                <div className="mt-3 p-4 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Preview Crop</span>
                  <div className={`w-14 h-14 bg-white border border-gray-200 overflow-hidden flex items-center justify-center ${
                    shape === 'round' ? 'rounded-full' : 'rounded-xl'
                  }`}>
                    <img src={imagePreview} alt="Crop Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold text-xs py-3 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="animate-spin" size={14} />
                ) : editId ? (
                  <Save size={14} />
                ) : (
                  <Plus size={14} />
                )}
                {editId ? 'Save Changes' : 'Add to popular menus'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white font-bold text-xs py-2.5 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Listing Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="text-vedicana-gold" size={16} />
              Active Popular Categories
            </h3>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader size={36} className="animate-spin text-vedicana-gold" />
                <span className="text-xs">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <p className="font-serif text-lg text-slate-400 mb-1">No Popular Categories Configured</p>
                <p className="text-xs max-w-sm mx-auto">Click the builder panel on the left to register a category with custom icons.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="pb-3 text-center w-20">Icon View</th>
                      <th className="pb-3 pl-4">Category Name</th>
                      <th className="pb-3">Slug</th>
                      <th className="pb-3 text-center">Box Shape</th>
                      <th className="pb-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-slate-800/40 hover:bg-slate-900/10 transition-colors text-xs">
                        {/* Icon column */}
                        <td className="py-4 flex justify-center">
                          <div className={`w-8 h-8 bg-white border border-slate-800 flex items-center justify-center p-1.5 shadow-sm overflow-hidden ${
                            cat.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                          }`}>
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        
                        {/* Name & Desc */}
                        <td className="py-4 pl-4">
                          <div className="font-bold text-slate-200">{cat.name}</div>
                          {cat.description && (
                            <div className="text-[10px] text-slate-500 font-light mt-0.5">{cat.description}</div>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="py-4 text-slate-400 font-mono text-[10px]">{cat.slug}</td>

                        {/* Shape */}
                        <td className="py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            cat.shape === 'round' 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                              : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                          }`}>
                            {cat.shape}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              className="text-slate-400 hover:text-vedicana-gold p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit popular category"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Delete popular category"
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
        </div>

      </div>
    </div>
  );
}
