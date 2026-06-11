"use client";
import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, Briefcase, Leaf, Heart, Users, Target } from 'lucide-react';
import Image from 'next/image';

export default function CareerPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience_years: '',
    location: '',
    cover_letter: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const positions = [
    "Ayurvedic Doctor / Practitioner",
    "Sales & Business Development",
    "Digital Marketing & E-Commerce",
    "Supply Chain & Operations",
    "Customer Support",
    "General Application"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 3 * 1024 * 1024) {
        setError('File size must be less than 3MB.');
        setFile(null);
        e.target.value = null;
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your CV (PDF or DOCX).');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('resume', file);

      const res = await fetch('/api/career', {
        method: 'POST',
        body: data, // fetch automatically sets Content-Type for FormData
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to submit application.');

      setSuccess(true);
      setFormData({
        full_name: '', email: '', phone: '', position: '', 
        experience_years: '', location: '', cover_letter: ''
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fdf8] pb-24">
      {/* Premium Hero Banner */}
      <div className="relative bg-vedicana-dark-green overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-vedicana-gold/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
            <Briefcase className="w-8 h-8 text-vedicana-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light">
            Become a part of VediCana Organics. Help us bring pure, authentic Ayurvedic wellness to the modern world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Culture / Why Join Us */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h2 className="text-xs font-bold text-vedicana-green uppercase tracking-widest mb-3">Why Join VediCana?</h2>
              <h3 className="text-3xl font-serif text-gray-900 mb-6">A Workplace Rooted in Wellness</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                At VediCana, we believe that true wellness starts from within our team. We are a passionate group of innovators, Ayurvedic practitioners, and nature enthusiasts dedicated to bridging the gap between ancient traditions and modern healthcare.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#eaf4e6] flex items-center justify-center text-vedicana-green flex-shrink-0">
                  <Leaf size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Purpose-Driven Work</h4>
                  <p className="text-sm text-gray-500">Every product you help develop or sell directly improves someone's quality of life naturally.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#fff6e5] flex items-center justify-center text-vedicana-gold flex-shrink-0">
                  <Heart size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Holistic Culture</h4>
                  <p className="text-sm text-gray-500">We prioritize work-life balance, mental well-being, and continuous learning for all team members.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-[#e6f4f2] flex items-center justify-center text-vedicana-teal flex-shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Growth & Innovation</h4>
                  <p className="text-sm text-gray-500">Be at the forefront of researching and standardizing Ayurvedic remedies for the global market.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-55 p-6 rounded-2xl border border-gray-100">
              <h4 className="font-serif text-xl mb-2">Have questions?</h4>
              <p className="text-sm text-gray-600">Contact our HR department directly at <a href="mailto:hrpartner@vedicana.com" className="text-vedicana-green font-semibold">hrpartner@vedicana.com</a></p>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
              <h3 className="text-2xl font-serif text-gray-900 mb-2">Submit Your Application</h3>
              <p className="text-gray-500 text-sm mb-8">Fill out the form below and upload your CV to apply for an open position.</p>

              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-fade-in-up">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-2xl font-serif text-emerald-800 mb-2">Application Received!</h4>
                  <p className="text-emerald-600 mb-6">Thank you for your interest in VediCana. Our HR team will review your CV and get back to you shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-emerald-700 font-semibold hover:text-emerald-800 underline"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required name="full_name" value={formData.full_name} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        type="email" required name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" required name="phone" value={formData.phone} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Position Applied For <span className="text-red-500">*</span></label>
                      <select 
                        required name="position" value={formData.position} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="" disabled>Select a position</option>
                        {positions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Experience (Years) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" step="0.5" min="0" required name="experience_years" value={formData.experience_years} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 3.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Location (City, State) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" required name="location" value={formData.location} onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all"
                        placeholder="Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Letter / Short Message</label>
                    <textarea 
                      name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vedicana-green focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Tell us briefly why you'd be a great fit for VediCana..."
                    ></textarea>
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload CV / Resume <span className="text-red-500">*</span></label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf,.doc,.docx" 
                        className="hidden" 
                      />
                      <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file ? \`\${(file.size / 1024 / 1024).toFixed(2)} MB\` : "PDF, DOCX up to 3MB"}
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-vedicana-green hover:bg-vedicana-dark-green text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="animate-spin" size={20} /> Submitting Application...</>
                    ) : (
                      "Submit Application"
                    )}
                  </button>

                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
