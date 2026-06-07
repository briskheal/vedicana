"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles, Layout, AlignLeft, AlignCenter, AlignRight, FileText, Loader, Plus } from 'lucide-react';

export default function DiscoverEditor() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const isCreateMode = rawSlug === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Image Upload States
  const [caption, setCaption] = useState('');
  const [alignment, setAlignment] = useState('center'); // left, center, right
  const [imageFile, setImageFile] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load existing page details if editing
  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/discover/${rawSlug}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to load page data');
        const data = await res.json();
        
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setIsActive(data.is_active);

        // Parse alignment from loaded HTML
        let detectedAlignment = 'center';
        if (data.content.includes('img-left') || data.content.includes('vc_align_left')) {
          detectedAlignment = 'left';
        } else if (data.content.includes('img-right') || data.content.includes('vc_align_right')) {
          detectedAlignment = 'right';
        }
        setAlignment(detectedAlignment);
      } catch (err) {
        console.error(err);
        setError('Error loading page details. Please ensure the slug is correct.');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [rawSlug, isCreateMode]);

  // Handle WebP Conversion via HTML5 Canvas
  const processImageToWebpBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize long/huge photos to standard max width 800px keeping aspect ratio
          const MAX_WIDTH = 800;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to dynamic WebP base64 format with premium 80% quality
          const webpBase64 = canvas.toDataURL('image/webp', 0.8);
          resolve(webpBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Insert generated layout HTML block into the editor content at cursor position
  const insertContentAtCursor = (htmlBlock) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentText = content;

    const newText = currentText.substring(0, startPos) + htmlBlock + currentText.substring(endPos);
    setContent(newText);

    // Refocus and place cursor after inserted content
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + htmlBlock.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 100);
  };

  // Real-time synchronization of layout placement in existing HTML content is disabled
  // to allow mixed image alignments (left, center, right) for different images on the same page.
  const updateHtmlAlignment = (newAlignment) => {
    setAlignment(newAlignment);
  };

  // Process and Insert Image Block with specific Float alignments
  const handleInsertImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please choose a photo file to insert.');
      return;
    }

    try {
      setProcessingImage(true);
      console.log('Uploading image to server in the background...');
      
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('pageSlug', slug || 'discover');

      const res = await fetch('/api/admin/discover/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image to server');
      }

      const data = await res.json();
      const cleanImageUrl = data.url;
      
      let alignmentClass = 'img-center';
      if (alignment === 'left') alignmentClass = 'img-left';
      else if (alignment === 'right') alignmentClass = 'img-right';

      // Clean HTML wrapper blocks matching globals.css floats
      const imgBlockHtml = `
<div class="img-wrap ${alignmentClass}">
  <img src="${cleanImageUrl}" alt="${caption || 'VediCana Herb Photo'}" />
  ${caption ? `<span class="caption">${caption}</span>` : ''}
</div>
`;

      insertContentAtCursor(imgBlockHtml);

      // Reset image state
      setImageFile(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Image block successfully uploaded and inserted!');
    } catch (err) {
      console.error(err);
      alert(`Error uploading image: ${err.message}`);
    } finally {
      setProcessingImage(false);
    }
  };

  // Helper buttons to insert tags
  const handleInsertTag = (tag) => {
    let block = '';
    if (tag === 'h2') block = '\n<h2 class="text-2xl font-serif text-vedicana-dark-green font-bold mt-8 mb-4">Header 2</h2>\n';
    else if (tag === 'h3') block = '\n<h3 class="text-xl font-serif text-vedicana-dark-green font-bold mt-6 mb-3">Header 3</h3>\n';
    else if (tag === 'p') block = '\n<p>Enter your paragraph content here. Make it informative and beautifully detailed.</p>\n';
    else if (tag === 'ul') block = '\n<ul class="list-disc pl-6 mb-6 space-y-2 text-gray-600">\n  <li>First key point</li>\n  <li>Second key point</li>\n</ul>\n';
    else if (tag === 'blockquote') block = '\n<blockquote class="border-l-4 border-vedicana-gold pl-5 italic my-8 text-gray-500 font-serif text-lg bg-gray-50/50 py-4 pr-4 rounded-r-lg">\n  "Ayurveda is the science of life and longevity."\n</blockquote>\n';
    else if (tag === 'table') block = `
<table class="w-full border-collapse my-8 shadow-sm rounded-xl overflow-hidden border border-gray-100">
  <thead>
    <tr class="bg-vedicana-dark-green text-white font-serif text-sm">
      <th class="p-4 text-left">Property / Herb</th>
      <th class="p-4 text-left">Benefits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-4 border-b border-gray-100 font-semibold">Active Ingredient</td>
      <td class="p-4 border-b border-gray-100">Pure botanical extracts without preservatives</td>
    </tr>
  </tbody>
</table>
`;

    insertContentAtCursor(block);
  };

  // Submit Handler (Create/Save)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and Content areas cannot be empty!');
      return;
    }

    const finalSlug = isCreateMode ? slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-') : rawSlug;
    if (isCreateMode && !finalSlug) {
      alert('Slug path is required in Create Mode!');
      return;
    }

    try {
      setSaving(true);
      const url = isCreateMode ? '/api/admin/discover' : `/api/admin/discover/${rawSlug}`;
      const method = isCreateMode ? 'POST' : 'PUT';

      const bodyData = {
        title,
        content,
        is_active: isActive
      };
      if (isCreateMode) {
        bodyData.slug = finalSlug;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save page');
      }

      alert('Page saved successfully!');
      router.push('/admin/discover');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(`Error saving page: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <a 
            href="/admin/discover" 
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </a>
          <div>
            <h1 className="text-2xl font-serif text-white font-bold mb-1">
              {isCreateMode ? 'Create Discover Page' : `Edit: ${title || rawSlug}`}
            </h1>
            <p className="text-slate-400 text-sm">Design layout alignments, upload photographs, and enrich rich-text HTML.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold text-sm uppercase tracking-wide px-6 py-3.5 rounded-lg transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} 
          {isCreateMode ? 'Publish Page' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3 bg-[#1e293b] rounded-xl border border-slate-800">
          <Loader size={36} className="animate-spin text-vedicana-gold" />
          <span>Fetching page data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">{error}</p>
          <a href="/admin/discover" className="mt-4 inline-block text-xs uppercase font-bold tracking-wide underline text-vedicana-gold hover:text-white">Back to Dashboard</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Editor Columns (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-[#1e293b] p-8 rounded-xl border border-slate-800 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title field */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold text-sm uppercase tracking-wider block">Page Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. About VediCana"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none transition-all"
                    required
                  />
                </div>

                {/* Slug field */}
                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold text-sm uppercase tracking-wider block">Slug Path</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. about"
                    disabled={!isCreateMode}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {/* Tag inserters toolbar */}
              <div className="space-y-2 border-t border-slate-800/80 pt-6">
                <label className="text-slate-300 font-semibold text-sm uppercase tracking-wider block flex items-center gap-1.5"><Layout size={16} className="text-vedicana-gold" /> Template Helpers</label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleInsertTag('h2')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">H2 Header</button>
                  <button type="button" onClick={() => handleInsertTag('h3')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">H3 Header</button>
                  <button type="button" onClick={() => handleInsertTag('p')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">Paragraph</button>
                  <button type="button" onClick={() => handleInsertTag('ul')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">Bullets List</button>
                  <button type="button" onClick={() => handleInsertTag('blockquote')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">Quote Block</button>
                  <button type="button" onClick={() => handleInsertTag('table')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 rounded transition-colors uppercase tracking-wide">Table</button>
                </div>
              </div>

              {/* Rich Content editing field */}
              <div className="space-y-2 border-t border-slate-800/80 pt-6">
                <label className="text-slate-300 font-semibold text-sm uppercase tracking-wider block flex items-center gap-1.5"><FileText size={16} className="text-vedicana-green" /> HTML Page Content</label>
                <textarea 
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Insert HTML or use the helpers to write content..."
                  rows={20}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green rounded-xl py-4 px-5 text-white font-mono text-sm leading-relaxed focus:outline-none transition-all placeholder-slate-700"
                  required
                />
              </div>

              {/* Visible Status checkbox */}
              <div className="flex items-center gap-3 border-t border-slate-800/80 pt-6">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 bg-slate-900 border-slate-800 text-vedicana-green focus:ring-vedicana-green focus:ring-offset-slate-950 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-slate-300 font-semibold text-sm uppercase tracking-wider cursor-pointer">Make page visible on the frontend</label>
              </div>

            </form>
          </div>

          {/* Photo Alignment Upload Sidebar (Right 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm space-y-6 sticky top-24">
              <h3 className="text-lg font-serif text-white font-bold pb-4 border-b border-slate-800 flex items-center gap-2">
                <ImageIcon className="text-vedicana-gold" size={20} /> Photo Layout Inserter
              </h3>

              <div className="space-y-4">
                {/* 1. File Upload */}
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs uppercase font-semibold tracking-wider block">Choose Image File</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                {/* 2. Photo alignment selection */}
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs uppercase font-semibold tracking-wider block flex items-center gap-1"><Sparkles size={14} className="text-vedicana-gold" /> Layout Placement</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button" 
                      onClick={() => updateHtmlAlignment('left')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold gap-1.5 transition-all ${
                        alignment === 'left' 
                          ? 'border-vedicana-green bg-vedicana-green/10 text-emerald-400' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <AlignLeft size={18} /> Left Float
                    </button>
                    <button 
                      type="button" 
                      onClick={() => updateHtmlAlignment('center')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold gap-1.5 transition-all ${
                        alignment === 'center' 
                          ? 'border-vedicana-green bg-vedicana-green/10 text-emerald-400' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <AlignCenter size={18} /> Center
                    </button>
                    <button 
                      type="button" 
                      onClick={() => updateHtmlAlignment('right')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold gap-1.5 transition-all ${
                        alignment === 'right' 
                          ? 'border-vedicana-green bg-vedicana-green/10 text-emerald-400' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <AlignRight size={18} /> Right Float
                    </button>
                  </div>
                </div>

                {/* 3. Caption field */}
                <div className="space-y-2">
                  <label className="text-slate-400 text-xs uppercase font-semibold tracking-wider block">Image Caption (Optional)</label>
                  <input 
                    type="text" 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Traditional Ayurvedic Herbs"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green"
                  />
                </div>

                {/* 4. Action insert button */}
                <button 
                  type="button"
                  onClick={handleInsertImage}
                  disabled={processingImage || !imageFile}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {processingImage ? (
                    <>
                      <Loader className="animate-spin text-vedicana-gold" size={16} />
                      Optimizing to WebP...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Insert Image Block
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Guidelines list */}
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 text-xs leading-relaxed text-slate-400 space-y-2">
                <span className="font-bold text-slate-300 block uppercase tracking-wider">Layout Rules:</span>
                <p><strong>Left/Right Floats</strong>: Floats images left or right on desktop with text wrapping beautifully around them. Ideal for detailed pages.</p>
                <p><strong>Center</strong>: Keeps large graphic pictures in the center with text flowing cleanly above and below.</p>
                <p><strong>Background Uploads</strong>: Your photos are uploaded, compressed, and resized in the background on the server. The text editor remains 100% clean and free of huge Base64 strings.</p>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
