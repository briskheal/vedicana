"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Sparkles, Loader, Check, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Heading, List } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // 'new' or product ID
  const isNew = id === 'new';

  // Catalog categories loaded from DB
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form Field States
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('100');
  const [categoryId, setCategoryId] = useState('');
  const [taxRate, setTaxRate] = useState('5');
  const [isFeatured, setIsFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [specification, setSpecification] = useState('');

  // HTML Previews toggles
  const [previewDesc, setPreviewDesc] = useState(false);
  const [previewShortDesc, setPreviewShortDesc] = useState(false);
  const [previewSpec, setPreviewSpec] = useState(false);

  // Multi-image WebP states
  const [primaryImage, setPrimaryImage] = useState('');
  const [gallery, setGallery] = useState(['', '', '']); // 3 slots for gallery

  // JSON variants state
  const [variants, setVariants] = useState([{ key: '', value: '' }]);
  const [variantPrices, setVariantPrices] = useState([]);

  // Textarea Refs for HTML editing tools
  const descRef = useRef(null);
  const shortDescRef = useRef(null);
  const specRef = useRef(null);

  // HTML content insertion at cursor position
  const insertHtml = (target, type) => {
    let ref, value, setValue;
    if (target === 'short_description') {
      ref = shortDescRef.current;
      value = shortDescription;
      setValue = setShortDescription;
    } else if (target === 'description') {
      ref = descRef.current;
      value = description;
      setValue = setDescription;
    } else {
      ref = specRef.current;
      value = specification;
      setValue = setSpecification;
    }

    if (!ref) return;

    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    const selectedText = value.substring(start, end) || '';

    let wrappedText = '';
    switch (type) {
      case 'left':
        wrappedText = `<p class="text-left">${selectedText}</p>`;
        break;
      case 'center':
        wrappedText = `<p class="text-center">${selectedText}</p>`;
        break;
      case 'right':
        wrappedText = `<p class="text-right">${selectedText}</p>`;
        break;
      case 'justify':
        wrappedText = `<p class="text-justify">${selectedText}</p>`;
        break;
      case 'bold':
        wrappedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        wrappedText = `<em>${selectedText}</em>`;
        break;
      case 'header':
        wrappedText = `<h3 class="text-lg font-serif text-vedicana-dark-green font-bold mt-4 mb-2">${selectedText}</h3>`;
        break;
      case 'list':
        wrappedText = `\n<ul class="list-disc pl-6 mb-4 space-y-1">\n  <li>${selectedText}</li>\n</ul>\n`;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    setValue(newValue);

    setTimeout(() => {
      ref.focus();
      const newPos = start + wrappedText.length;
      ref.setSelectionRange(newPos, newPos);
    }, 100);
  };

  // Load Categories & Product Details (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // 1. Fetch categories
        const catRes = await fetch('/api/admin/products');
        if (!catRes.ok) throw new Error('Failed to fetch categories list');
        const catData = await catRes.json();
        setCategories(catData.categories || []);
        
        if (catData.categories?.length > 0 && isNew) {
          setCategoryId(catData.categories[0].id.toString());
        }

        // 2. Fetch product if editing
        if (!isNew) {
          const prodRes = await fetch(`/api/admin/products/${id}`);
          if (!prodRes.ok) {
            if (prodRes.status === 404) {
              throw new Error(`Product with ID ${id} was not found.`);
            }
            throw new Error('Failed to fetch product details.');
          }
          const product = await prodRes.json();

          setTitle(product.title || '');
          setSlug(product.slug || '');
          setPrice(product.price ? product.price.toString() : '');
          setSalePrice(product.sale_price ? product.sale_price.toString() : '');
          setStock(product.stock !== undefined ? product.stock.toString() : '0');
          const loadedCategoryId = product.categoryId !== undefined ? product.categoryId : product.CategoryId;
          setCategoryId(loadedCategoryId ? loadedCategoryId.toString() : '');
          setTaxRate(product.tax_rate !== undefined ? product.tax_rate.toString() : '5');
          setIsFeatured(!!product.is_featured);
          setDescription(product.description || '');
          setShortDescription(product.short_description || '');
          setSpecification(product.specification || '');
          setPrimaryImage(product.image || '');

          if (product.gallery && Array.isArray(product.gallery)) {
            const g = [...product.gallery];
            setGallery([g[0] || '', g[1] || '', g[2] || '']);
          } else {
            setGallery(['', '', '']);
          }

          if (product.additional_info && typeof product.additional_info === 'object') {
            const loadedVariants = Object.entries(product.additional_info)
              .filter(([k]) => k !== 'variants')
              .map(([k, v]) => ({ key: k, value: String(v) }));
            setVariants(loadedVariants.length > 0 ? loadedVariants : [{ key: '', value: '' }]);

            if (Array.isArray(product.additional_info.variants)) {
              setVariantPrices(product.additional_info.variants);
            } else {
              setVariantPrices([]);
            }
          } else {
            setVariants([{ key: '', value: '' }]);
            setVariantPrices([]);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not retrieve data from PostgreSQL.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew]);

  // Handle auto slug generations
  useEffect(() => {
    if (autoSlug && isNew) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generated);
    }
  }, [title, autoSlug, isNew]);

  // Compress Image to WebP using Canvas
  const handleImageUpload = (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress and encode as base64 WebP
        const base64WebP = canvas.toDataURL('image/webp', 0.85);
        
        if (slotIndex === 0) {
          setPrimaryImage(base64WebP);
        } else {
          const newGallery = [...gallery];
          newGallery[slotIndex - 1] = base64WebP;
          setGallery(newGallery);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (slotIndex) => {
    if (slotIndex === 0) {
      setPrimaryImage('');
    } else {
      const newGallery = [...gallery];
      newGallery[slotIndex - 1] = '';
      setGallery(newGallery);
    }
  };

  // Variant row builder actions
  const handleAddVariant = () => {
    setVariants([...variants, { key: '', value: '' }]);
  };

  const handleVariantChange = (index, field, val) => {
    const updated = [...variants];
    updated[index][field] = val;
    setVariants(updated);
  };

  const handleRemoveVariant = (index) => {
    const updated = variants.filter((_, idx) => idx !== index);
    setVariants(updated.length > 0 ? updated : [{ key: '', value: '' }]);
  };
  // Submit form handler
  const handleSubmit = async (e, stayOnPage = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title.trim()) {
      alert('Please fill out the product title.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      alert('Please enter a valid base price.');
      return;
    }
    if (salePrice && parseFloat(salePrice) > parseFloat(price)) {
      alert('Sale price (selling price) cannot exceed the retail price (MRP).');
      return;
    }

    setSaving(true);
    setError(null);

    // Compile dynamic variant JSON key-values
    const additional_info = {};
    variants.forEach(v => {
      if (v.key.trim() && v.value.trim() && v.key.trim() !== 'variants') {
        additional_info[v.key.trim()] = v.value.trim();
      }
    });

    // Compile size variants
    const cleanVariantPrices = variantPrices
      .filter(vp => vp.size && vp.size.trim())
      .map(vp => ({
        size: vp.size.trim(),
        price: parseFloat(vp.price) || 0,
        sale_price: vp.sale_price && vp.sale_price.toString().trim() !== '' ? parseFloat(vp.sale_price) : null
      }));

    if (cleanVariantPrices.length > 0) {
      additional_info.variants = cleanVariantPrices;
      // Also write Variant attribute for general/backward compatibility
      additional_info.Variant = cleanVariantPrices.map(vp => vp.size).join(', ');
    }

    // Compile gallery slots removing empty slots
    const cleanGallery = gallery.filter(img => img.trim() !== '');

    const payload = {
      title,
      slug: slug.trim(),
      price: parseFloat(price),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock, 10) || 0,
      is_featured: isFeatured,
      description,
      short_description: shortDescription,
      specification,
      additional_info: Object.keys(additional_info).length > 0 ? additional_info : null,
      tax_rate: parseInt(taxRate, 10),
      image: primaryImage || null,
      gallery: cleanGallery.length > 0 ? cleanGallery : null,
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
      CategoryId: categoryId ? parseInt(categoryId, 10) : null
    };

    try {
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product database row');
      }

      const savedProduct = await res.json();

      if (stayOnPage) {
        alert('Product draft saved successfully! You can continue editing.');
        if (isNew && savedProduct && savedProduct.id) {
          router.replace(`/admin/products/edit/${savedProduct.id}`);
        } else {
          router.refresh();
        }
      } else {
        alert(isNew ? 'Product added successfully!' : 'Product details updated successfully!');
        router.push('/admin/products');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader size={40} className="animate-spin text-vedicana-gold" />
        <span className="text-sm font-semibold">Loading product settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Back Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/products')}
            className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
              {isNew ? 'Inject New Remedy' : 'Modify Product Parameters'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Configure base parameters, custom GST brackets, and upload up to 4 compressed WebP images.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
          {isNew ? 'Save Product' : 'Apply Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Editor Grid layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Basic Form Controls - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 mb-1">
              Core Identity & Pricing
            </h3>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Belamo Multani Mitti Powder"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Url Slug (Path)</label>
                  {isNew && (
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 focus:ring-0 w-3 h-3"
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
                  placeholder="e.g. belamo-multani-mitti-powder"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Retail Price, Sale Price, Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retail Price (MRP) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 font-mono text-sm">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="299.00"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sale Price (Discount)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 font-mono text-sm">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Optional (MRP used if blank)"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Inventory Quantity</label>
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Category Select, GST Tax Selector, Featured Switch */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Category</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm cursor-pointer"
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">GST Tax Bracket (%) *</label>
                <select 
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono cursor-pointer"
                  required
                >
                  <option value="0">0% (GST Exempt)</option>
                  <option value="5">5% (Essential Goods)</option>
                  <option value="12">12% (Standard Ayurvedic Products)</option>
                  <option value="18">18% (Wellness / Cosmetic Remedies)</option>
                  <option value="28">28% (Luxury items)</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="inline-flex items-center gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg px-4 h-[45px] cursor-pointer transition-colors select-none">
                  <input 
                    type="checkbox" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 focus:ring-0 text-vedicana-green w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">Featured Item</span>
                    <span className="text-[9px] text-slate-500 block leading-none mt-0.5">Showcase on Home page grid</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Size Variants Pricing Builder */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-1 gap-2">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                  Sizing & Variant Pricing
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal mt-1">
                  Define explicit prices for different variant sizes. These will override the base price.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setVariantPrices([...variantPrices, { size: '', price: '', sale_price: '' }])}
                className="text-xs font-bold uppercase tracking-wider text-vedicana-green hover:text-emerald-450 flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-1.5 rounded transition-colors self-start sm:self-auto"
              >
                <Plus size={12} /> Add Variant
              </button>
            </div>

            {variantPrices.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No variants configured. Product will use the base price of ₹{price || '0.00'} only.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <div className="col-span-5">Size (e.g. 500 ML, 1 LTR)</div>
                  <div className="col-span-3">MRP (₹)</div>
                  <div className="col-span-3">Sale Price (₹)</div>
                  <div className="col-span-1 text-right">Delete</div>
                </div>

                {variantPrices.map((vp, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input 
                        type="text"
                        value={vp.size}
                        onChange={(e) => {
                          const updated = [...variantPrices];
                          updated[idx].size = e.target.value;
                          setVariantPrices(updated);
                        }}
                        placeholder="e.g. 500 ML"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-vedicana-green text-xs font-semibold"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number"
                        step="0.01"
                        value={vp.price}
                        onChange={(e) => {
                          const updated = [...variantPrices];
                          updated[idx].price = e.target.value;
                          setVariantPrices(updated);
                        }}
                        placeholder="Price"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-vedicana-green text-xs font-mono"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number"
                        step="0.01"
                        value={vp.sale_price || ''}
                        onChange={(e) => {
                          const updated = [...variantPrices];
                          updated[idx].sale_price = e.target.value;
                          setVariantPrices(updated);
                        }}
                        placeholder="Optional"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-vedicana-green text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = variantPrices.filter((_, i) => i !== idx);
                          setVariantPrices(updated);
                        }}
                        className="text-slate-500 hover:text-red-400 p-2 transition-colors cursor-pointer inline-flex items-center"
                        title="Remove Variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HTML Short Description Block */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                Overview Short Description (HTML) — Shows near product box/gallery
              </h3>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  disabled={saving}
                  className="text-xs font-bold uppercase tracking-wider bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1 rounded border border-emerald-600 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewShortDesc(!previewShortDesc)}
                  className="text-xs font-bold uppercase tracking-wider text-vedicana-gold hover:underline flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded border border-slate-750 transition-all"
                >
                  {previewShortDesc ? <EyeOff size={13} /> : <Eye size={13} />}
                  {previewShortDesc ? 'Editor Mode' : 'Live Render'}
                </button>
              </div>
            </div>

            {previewShortDesc ? (
              <div 
                className="bg-white text-gray-800 p-6 rounded-lg min-h-[120px] border border-slate-800 max-h-[250px] overflow-y-auto discover-content"
                dangerouslySetInnerHTML={{ __html: shortDescription || '<p class="italic text-gray-400">Empty short description layout</p>' }}
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-1.5 rounded-t-lg">
                  <button type="button" onClick={() => insertHtml('short_description', 'left')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Left"><AlignLeft size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'center')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Center"><AlignCenter size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'right')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Right"><AlignRight size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'justify')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Justify"><AlignJustify size={14} /></button>
                  <div className="w-px h-4 bg-slate-850 mx-1"></div>
                  <button type="button" onClick={() => insertHtml('short_description', 'bold')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bold Text"><Bold size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'italic')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Italic Text"><Italic size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'header')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="H3 Header"><Heading size={14} /></button>
                  <button type="button" onClick={() => insertHtml('short_description', 'list')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bullet List"><List size={14} /></button>
                </div>
                <textarea 
                  ref={shortDescRef}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={4}
                  placeholder="<p>A brief highlight of the remedy, e.g. 100% natural multani mitti...</p>"
                  className="w-full bg-slate-900 border border-slate-850 border-t-0 text-slate-300 rounded-b-lg px-4 py-3 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono leading-relaxed"
                />
              </div>
            )}
            <p className="text-[10px] text-slate-500 leading-normal">
              HTML formatting permitted. Keep paragraph classes minimal. This will show next to the image gallery on the product page.
            </p>
          </div>

          {/* HTML Description Block */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                Detailed Product Description (HTML)
              </h3>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  disabled={saving}
                  className="text-xs font-bold uppercase tracking-wider bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1 rounded border border-emerald-600 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewDesc(!previewDesc)}
                  className="text-xs font-bold uppercase tracking-wider text-vedicana-gold hover:underline flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded border border-slate-750 transition-all"
                >
                  {previewDesc ? <EyeOff size={13} /> : <Eye size={13} />}
                  {previewDesc ? 'Editor Mode' : 'Live Render'}
                </button>
              </div>
            </div>

            {previewDesc ? (
              <div 
                className="bg-white text-gray-800 p-6 rounded-lg min-h-[160px] border border-slate-800 max-h-[300px] overflow-y-auto discover-content"
                dangerouslySetInnerHTML={{ __html: description || '<p class="italic text-gray-400">Empty description layout</p>' }}
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-1.5 rounded-t-lg">
                  <button type="button" onClick={() => insertHtml('description', 'left')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Left"><AlignLeft size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'center')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Center"><AlignCenter size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'right')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Right"><AlignRight size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'justify')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Justify"><AlignJustify size={14} /></button>
                  <div className="w-px h-4 bg-slate-850 mx-1"></div>
                  <button type="button" onClick={() => insertHtml('description', 'bold')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bold Text"><Bold size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'italic')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Italic Text"><Italic size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'header')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="H3 Header"><Heading size={14} /></button>
                  <button type="button" onClick={() => insertHtml('description', 'list')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bullet List"><List size={14} /></button>
                </div>
                <textarea 
                  ref={descRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  placeholder="<p>Belamo Multani Mitti Powder (Fullers Earth) gives the skin a radiant glow...</p>"
                  className="w-full bg-slate-900 border border-slate-850 border-t-0 text-slate-300 rounded-b-lg px-4 py-3 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono leading-relaxed"
                />
              </div>
            )}
            <p className="text-[10px] text-slate-500 leading-normal">
              HTML formatting permitted. Keep paragraph classes minimal. Wrap lists in <code>&lt;ul&gt;</code> and list items in <code>&lt;li&gt;</code>.
            </p>
          </div>

          {/* HTML Specification Block */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                Technical Specifications (HTML)
              </h3>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleSubmit(null, true)}
                  disabled={saving}
                  className="text-xs font-bold uppercase tracking-wider bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white px-3 py-1 rounded border border-emerald-600 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewSpec(!previewSpec)}
                  className="text-xs font-bold uppercase tracking-wider text-vedicana-gold hover:underline flex items-center gap-1.5 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-1 rounded border border-slate-750 transition-all"
                >
                  {previewSpec ? <EyeOff size={13} /> : <Eye size={13} />}
                  {previewSpec ? 'Editor Mode' : 'Live Render'}
                </button>
              </div>
            </div>

            {previewSpec ? (
              <div 
                className="bg-white text-gray-800 p-6 rounded-lg min-h-[140px] border border-slate-800 max-h-[300px] overflow-y-auto discover-content"
                dangerouslySetInnerHTML={{ __html: specification || '<p class="italic text-gray-400 font-serif">No specifications listed</p>' }}
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-855 p-1.5 rounded-t-lg">
                  <button type="button" onClick={() => insertHtml('specification', 'left')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Left"><AlignLeft size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'center')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Center"><AlignCenter size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'right')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Right"><AlignRight size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'justify')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Align Justify"><AlignJustify size={14} /></button>
                  <div className="w-px h-4 bg-slate-850 mx-1"></div>
                  <button type="button" onClick={() => insertHtml('specification', 'bold')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bold Text"><Bold size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'italic')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Italic Text"><Italic size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'header')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="H3 Header"><Heading size={14} /></button>
                  <button type="button" onClick={() => insertHtml('specification', 'list')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900 transition-colors" title="Bullet List"><List size={14} /></button>
                </div>
                <textarea 
                  ref={specRef}
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  rows={5}
                  placeholder="<ul><li><strong>Packaging:</strong> 200g Eco-friendly Pouch</li><li><strong>Usage:</strong> External only</li></ul>"
                  className="w-full bg-slate-900 border border-slate-855 border-t-0 text-slate-300 rounded-b-lg px-4 py-3 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green text-sm font-mono leading-relaxed"
                />
              </div>
            )}
            <p className="text-[10px] text-slate-500 leading-normal">
              HTML list formats, strong highlights, or detail tables represent catalog properties beautifully inside the Specifications tab.
            </p>
          </div>

        </div>

        {/* Right Sidebar - WebP Photo Canvas + Variant builder */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Uploader Slots */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3 mb-1">
              WebP Photo Gallery (Max 4)
            </h3>

            {/* Primary Slot */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Primary Visual Showcase (Slot 1)</span>
              <div className="relative group rounded-xl border border-slate-800/80 bg-slate-950 p-2.5 min-h-[140px] flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-vedicana-green">
                {primaryImage ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img 
                      src={primaryImage} 
                      alt="Primary remedy" 
                      className="max-h-[140px] w-auto object-contain rounded-lg"
                    />
                    <button 
                      type="button"
                      onClick={() => handleClearImage(0)}
                      className="absolute top-1.5 right-1.5 bg-red-600/90 text-white rounded-md p-1.5 hover:bg-red-700 transition-colors shadow cursor-pointer text-xs"
                      title="Clear slot"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer w-full text-center py-6 select-none">
                    <ImageIcon size={28} className="text-slate-600 group-hover:text-vedicana-green transition-colors" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-400">Click to Upload Primary</span>
                    <span className="text-[9px] text-slate-600">Converts automatically to compressed WebP</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 0)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Slots */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block border-t border-slate-800/60 pt-3">Gallery Extra Angles (Slots 2 - 4)</span>
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((img, idx) => {
                  const slotIndex = idx + 1; // 1, 2, 3 mapped to slotIndex 1, 2, 3 in state (or 1, 2, 3 in layout slots 2, 3, 4)
                  return (
                    <div key={idx} className="relative group rounded-lg border border-slate-800 bg-slate-950 p-1 flex items-center justify-center h-20 overflow-hidden transition-all duration-300 hover:border-vedicana-teal">
                      {img ? (
                        <>
                          <img 
                            src={img} 
                            alt={`Gallery ${slotIndex}`} 
                            className="h-full w-full object-contain rounded-md"
                          />
                          <button 
                            type="button"
                            onClick={() => handleClearImage(slotIndex)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-750 text-white rounded p-1 transition-colors cursor-pointer text-[10px]"
                            title="Remove"
                          >
                            <Trash2 size={10} />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full select-none gap-1">
                          <Plus size={14} className="text-slate-600 group-hover:text-vedicana-teal transition-colors" />
                          <span className="text-[9px] font-semibold text-slate-600">Slot {slotIndex + 1}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, slotIndex)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Variant Row Builder */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">
                Additional Info Attributes
              </h3>
              <button 
                type="button"
                onClick={handleAddVariant}
                className="text-xs font-bold uppercase tracking-wider text-vedicana-teal hover:underline flex items-center gap-1 cursor-pointer bg-slate-900 border border-slate-800 px-2 py-1 rounded"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              Specify properties that render under the "Additional Info" tab (e.g. key: "Brand", value: "VediCana").
            </p>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input 
                    type="text"
                    value={v.key}
                    onChange={(e) => handleVariantChange(idx, 'key', e.target.value)}
                    placeholder="Key (e.g. Weight)"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-vedicana-teal text-xs font-semibold"
                  />
                  <input 
                    type="text"
                    value={v.value}
                    onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 100g)"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-vedicana-teal text-xs font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Save Action Bar */}
        <div className="lg:col-span-3 flex justify-end gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-lg mt-6">
          <button 
            type="button"
            onClick={() => router.push('/admin/products')}
            className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white px-6 py-2.5 rounded-lg border border-slate-800 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="bg-vedicana-green hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Save Product' : 'Apply Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
