"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, ClipboardList, Info, Star, FileText, Loader } from 'lucide-react';

export default function ProductTabs({ productSlug, description, specification, additionalInfo }) {
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form states
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Load reviews on mount & when slug changes
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !comment.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, email, rating, comment })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review');
      }

      setSubmitSuccess(true);
      setAuthor('');
      setEmail('');
      setRating(5);
      setComment('');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (num, interactive = false, onSelect = null) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= num;
          return (
            <Star
              key={idx}
              size={interactive ? 24 : 16}
              className={`transition-colors duration-200 ${
                isFilled 
                  ? 'fill-vedicana-gold text-vedicana-gold' 
                  : 'text-gray-300 hover:text-vedicana-gold/60'
              } ${interactive ? 'cursor-pointer' : ''}`}
              onClick={() => interactive && onSelect && onSelect(starValue)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      {/* Tabs Navigation Links */}
      <div className="flex flex-wrap border-b border-gray-150 justify-center gap-2 sm:gap-8 mb-10">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex items-center gap-2 pb-4 px-3 font-serif text-base sm:text-lg font-medium transition-all focus:outline-none relative border-b-2 uppercase tracking-wide cursor-pointer ${
            activeTab === 'description'
              ? 'border-vedicana-green text-vedicana-green'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <FileText size={18} /> Description
        </button>
        <button
          onClick={() => setActiveTab('specification')}
          className={`flex items-center gap-2 pb-4 px-3 font-serif text-base sm:text-lg font-medium transition-all focus:outline-none relative border-b-2 uppercase tracking-wide cursor-pointer ${
            activeTab === 'specification'
              ? 'border-vedicana-green text-vedicana-green'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={18} /> Specification
        </button>
        <button
          onClick={() => setActiveTab('additional_info')}
          className={`flex items-center gap-2 pb-4 px-3 font-serif text-base sm:text-lg font-medium transition-all focus:outline-none relative border-b-2 uppercase tracking-wide cursor-pointer ${
            activeTab === 'additional_info'
              ? 'border-vedicana-green text-vedicana-green'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Info size={18} /> Additional Info
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 pb-4 px-3 font-serif text-base sm:text-lg font-medium transition-all focus:outline-none relative border-b-2 uppercase tracking-wide cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-vedicana-green text-vedicana-green'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={18} /> Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Panels Content */}
      <div className="max-w-4xl mx-auto px-4">
        
        {/* DESCRIPTION PANEL */}
        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6 discover-content">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        )}

        {/* SPECIFICATION PANEL */}
        {activeTab === 'specification' && (
          <div className="prose max-w-none text-gray-600 leading-relaxed space-y-6 discover-content">
            {specification ? (
              <div dangerouslySetInnerHTML={{ __html: specification }} />
            ) : (
              <div className="py-8 text-center text-gray-400 italic">
                No formal specifications loaded for this remedy.
              </div>
            )}
          </div>
        )}

        {/* ADDITIONAL INFO PANEL */}
        {activeTab === 'additional_info' && (
          <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            {additionalInfo && Object.keys(additionalInfo).length > 0 ? (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(additionalInfo).map(([label, val], idx) => (
                    <tr 
                      key={label}
                      className={idx % 2 === 0 ? 'bg-[#fcfcfa]' : 'bg-white'}
                    >
                      <th className="p-4 w-1/3 font-serif font-semibold text-gray-700 border-b border-gray-100 text-sm md:text-base uppercase tracking-wider">{label}</th>
                      <td className="p-4 border-b border-gray-100 text-gray-600 text-sm md:text-base">
                        {(() => {
                          if (val === null || val === undefined) return '';
                          if (typeof val === 'object') {
                            if (Array.isArray(val)) {
                              if (label.toLowerCase() === 'variants') {
                                return val.map(v => {
                                  const priceStr = v.sale_price && v.sale_price < v.price 
                                    ? `₹${v.sale_price} (MRP: ₹${v.price})`
                                    : `₹${v.price}`;
                                  return `${v.size || 'Default'}: ${priceStr}`;
                                }).join(', ');
                              }
                              return val.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
                            }
                            return Object.entries(val)
                              .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                              .join(', ');
                          }
                          return String(val);
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-400 italic">
                No additional attributes specified for this product.
              </div>
            )}
          </div>
        )}

        {/* REVIEWS PANEL */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Reviews list (Left 3/5) */}
            <div className="lg:col-span-3 space-y-6">
              <h3 className="text-xl font-serif text-vedicana-dark-green font-bold border-b border-gray-100 pb-3">
                Reviews ({reviews.length})
              </h3>

              {loadingReviews ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader className="animate-spin text-vedicana-gold" size={24} />
                  <span className="text-xs">Fetching testimonials...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-gray-400 italic">
                  There are no reviews yet. Be the first to review this product.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-bold text-gray-800">{rev.author}</span>
                        <span className="text-xs text-gray-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="py-0.5">{renderStars(rev.rating)}</div>
                      <p className="text-sm text-gray-600 leading-relaxed font-sans">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Submission Form (Right 2/5) */}
            <div className="lg:col-span-2 bg-[#fcfcfa] p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 h-fit">
              <h3 className="text-lg font-serif text-gray-900 font-bold border-b border-gray-150 pb-3">
                Add a Review
              </h3>

              {submitSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl text-emerald-700 text-xs leading-relaxed space-y-2">
                  <p className="font-semibold">Review Submitted Successfully!</p>
                  <p>Thank you! Your testimonial has been received and will appear on the store once approved by the administrator.</p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-2 text-vedicana-green underline font-bold uppercase tracking-wider text-[10px]"
                  >
                    Write another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs">
                      {submitError}
                    </div>
                  )}

                  {/* Rating selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-semibold tracking-wider text-gray-500 block">Your Rating *</label>
                    {renderStars(rating, true, setRating)}
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-semibold tracking-wider text-gray-500 block" htmlFor="authorName">Name *</label>
                    <input
                      type="text"
                      id="authorName"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-gray-250 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green"
                      required
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-semibold tracking-wider text-gray-500 block" htmlFor="authorEmail">Email *</label>
                    <input
                      type="email"
                      id="authorEmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-white border border-gray-250 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green"
                      required
                    />
                  </div>

                  {/* Comment field */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-semibold tracking-wider text-gray-500 block" htmlFor="reviewComment">Your Review *</label>
                    <textarea
                      id="reviewComment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your detailed experience with this organic remedy..."
                      rows={5}
                      className="w-full bg-white border border-gray-250 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-vedicana-green focus:ring-1 focus:ring-vedicana-green leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-vedicana-green hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader className="animate-spin" size={14} /> : null}
                    Submit Testimonial
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
