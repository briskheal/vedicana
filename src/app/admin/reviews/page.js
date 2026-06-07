"use client";
import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, MessageSquare, Star, Trash2, Loader, ExternalLink } from 'lucide-react';

export default function ReviewModerationDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' or 'approved'

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not fetch reviews. Ensure database is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update review status');
      
      const updated = await res.json();
      // Update local state
      setReviews(reviews.map(rev => rev.id === id ? { ...rev, is_approved: updated.is_approved } : rev));
      alert(updated.is_approved ? 'Testimonial successfully approved!' : 'Approval successfully revoked.');
    } catch (err) {
      console.error(err);
      alert('Error updating approval. Please try again.');
    }
  };

  const handleDelete = async (id, author) => {
    if (!confirm(`Are you sure you want to delete this review by "${author}" permanently?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete review');
      
      setReviews(reviews.filter(rev => rev.id !== id));
      alert('Review permanently deleted.');
    } catch (err) {
      console.error(err);
      alert('Error deleting review.');
    }
  };

  const filteredReviews = reviews.filter(rev => 
    activeSubTab === 'pending' ? !rev.is_approved : rev.is_approved
  );

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star 
            key={idx} 
            size={14} 
            className={idx < rating ? 'fill-vedicana-gold text-vedicana-gold' : 'text-slate-700'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b] p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif text-white font-bold mb-1 flex items-center gap-2">
            <MessageSquare className="text-vedicana-gold" size={24} /> Testimonial Moderation Console
          </h1>
          <p className="text-slate-400 text-sm">Review, approve, or censor customer ratings before they display publicly on your shop.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 py-1.5 px-4 rounded-full border border-slate-800 text-xs">
          <ShieldAlert size={14} className="text-vedicana-gold animate-pulse" />
          <span className="text-slate-300 font-medium">Safe Mode Active</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`pb-3 px-2 text-sm font-semibold tracking-wider uppercase transition-colors relative focus:outline-none cursor-pointer ${
            activeSubTab === 'pending'
              ? 'text-vedicana-gold border-b-2 border-vedicana-gold'
              : 'text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          Pending Approval ({reviews.filter(r => !r.is_approved).length})
        </button>
        <button
          onClick={() => setActiveSubTab('approved')}
          className={`pb-3 px-2 text-sm font-semibold tracking-wider uppercase transition-colors relative focus:outline-none cursor-pointer ${
            activeSubTab === 'approved'
              ? 'text-vedicana-gold border-b-2 border-vedicana-gold'
              : 'text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          Approved Testimonials ({reviews.filter(r => r.is_approved).length})
        </button>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3 bg-[#1e293b] rounded-xl border border-slate-800">
          <Loader size={36} className="animate-spin text-vedicana-gold" />
          <span className="text-sm">Fetching testimonials...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-[#1e293b] rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-3">
          <MessageSquare size={32} className="text-slate-600" />
          <p className="text-base font-serif text-slate-400">No {activeSubTab} reviews found</p>
          <p className="text-xs text-slate-500">Reviews submitted by customers will show up here for moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all"
            >
              <div className="space-y-4">
                {/* Author Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base leading-snug">{rev.author}</h3>
                    <span className="text-xs text-slate-400 font-mono">{rev.email}</span>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">{renderStars(rev.rating)}</div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Target Product Block */}
                {rev.Product && (
                  <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <img 
                      src={rev.Product.image || 'https://via.placeholder.com/80'} 
                      alt={rev.Product.title}
                      className="w-10 h-10 object-contain bg-white rounded-md p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-vedicana-gold font-bold block leading-none mb-1">Target Product</span>
                      <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight">{rev.Product.title}</h4>
                    </div>
                    <a 
                      href={`/shop/${rev.Product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded transition-colors"
                      title="View product detail page"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Review Text */}
                <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4 mt-5 justify-end">
                <button
                  onClick={() => handleDelete(rev.id, rev.author)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  title="Permanently reject/delete"
                >
                  <Trash2 size={14} /> Reject Review
                </button>
                <button
                  onClick={() => handleApprove(rev.id, rev.is_approved)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    rev.is_approved
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                  title={rev.is_approved ? 'Revoke review validation' : 'Publish review to shop'}
                >
                  {rev.is_approved ? (
                    <>
                      <X size={14} /> Revoke Approval
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Approve Review
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
