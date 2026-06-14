"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Music, RefreshCw } from 'lucide-react';

export default function MantrasLibrary() {
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const fetchMantras = async () => {
    try {
      const res = await fetch('/api/admin/mantras');
      const data = await res.json();
      setMantras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMantras();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/mantras', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setTitle('');
        setFile(null);
        e.target.reset();
        await fetchMantras();
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mantra?')) return;
    try {
      const res = await fetch(`/api/admin/mantras/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMantras(mantras.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mantras Library</h1>
          <p className="text-slate-500 mt-1">Manage background audio mantras for the Vedic Culture page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">Upload New Mantra</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mantra Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vedicana-green focus:border-vedicana-green"
                  placeholder="e.g., Gayatri Mantra"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audio File (.mp3, .ogg)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                  <input 
                    type="file" 
                    accept="audio/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-vedicana-green hover:file:bg-green-100"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading || !title || !file}
                className="w-full bg-vedicana-dark-green text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-vedicana-green transition-colors disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                {uploading ? 'Uploading...' : 'Upload Mantra'}
              </button>
            </form>
          </div>
        </div>

        {/* Mantras List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Library Tracks</h2>
              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border">{mantras.length} tracks</span>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <RefreshCw className="animate-spin mb-2" size={24} />
                Loading...
              </div>
            ) : mantras.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Music size={48} className="mx-auto mb-3 opacity-20" />
                <p>No mantras found in the library.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {mantras.map((mantra) => (
                  <div key={mantra.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-vedicana-green flex items-center justify-center">
                        <Music size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{mantra.title}</h3>
                        <p className="text-xs text-slate-500">{mantra.filename} • {new Date(mantra.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <audio controls src={`/api/mantras/audio/${mantra.id}`} className="h-8 w-48 hidden md:block" />
                      <button 
                        onClick={() => handleDelete(mantra.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Mantra"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
