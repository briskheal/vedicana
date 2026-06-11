'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Eye, Leaf, ArrowRight, X } from 'lucide-react';

const CATEGORIES = ['All', 'Wellness', 'Ayurveda', 'Recipes', 'Lifestyle', 'Product News'];

const CATEGORY_STYLES = {
  Wellness:       { bg: 'bg-green-100',   text: 'text-green-700',   border: 'border-green-300'  },
  Ayurveda:       { bg: 'bg-yellow-100',  text: 'text-yellow-700',  border: 'border-yellow-300' },
  Recipes:        { bg: 'bg-orange-100',  text: 'text-orange-600',  border: 'border-orange-300' },
  Lifestyle:      { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-300' },
  'Product News': { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300'   },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function AuthorAvatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006d39] to-[#b8962e] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
      {(name || 'V')[0].toUpperCase()}
    </div>
  );
}

function CategoryBadge({ category }) {
  const s = CATEGORY_STYLES[category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {category}
    </span>
  );
}

function BlogCard({ blog }) {
  const displayDate = blog.published_at || blog.createdAt;
  return (
    <Link href={`/blog/${blog.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#006d39]/10 to-[#b8962e]/10 flex-shrink-0">
        {blog.cover_image ? (
          <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Leaf size={40} className="text-[#006d39]/30" /></div>
        )}
        <div className="absolute top-3 left-3"><CategoryBadge category={blog.category} /></div>
        {blog.is_featured && (
          <div className="absolute top-3 right-3 bg-[#b8962e] text-white text-[10px] font-extrabold px-2 py-1 rounded-full">★ Featured</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-900 font-bold text-lg leading-snug mb-2 group-hover:text-[#006d39] transition-colors line-clamp-2 font-serif">{blog.title}</h3>
        {blog.excerpt && <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{blog.excerpt}</p>}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AuthorAvatar name={blog.author} />
            <span className="text-gray-600 text-xs font-medium truncate">{blog.author}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px] flex-shrink-0">
            <span className="flex items-center gap-1"><Clock size={11} /> {blog.read_time || 5} min</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {blog.views || 0}</span>
          </div>
        </div>
        <div className="text-gray-400 text-[11px] mt-2 flex items-center gap-1">
          <Calendar size={11} /> {formatDate(displayDate)}
        </div>
      </div>
    </Link>
  );
}

function FeaturedPost({ blog }) {
  const displayDate = blog.published_at || blog.createdAt;
  return (
    <Link href={`/blog/${blog.slug}`} className="group relative rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row mb-14 min-h-[320px] hover:-translate-y-1 transition-transform duration-300">
      <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden">
        {blog.cover_image ? (
          <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#006d39]/20 to-[#b8962e]/10">
            <Leaf size={60} className="text-[#006d39]/30" />
          </div>
        )}
      </div>
      <div className="md:w-1/2 bg-gradient-to-br from-[#0d1f13] to-[#132b1c] p-8 md:p-10 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-[#b8962e] text-white text-[11px] font-extrabold px-3 py-1 rounded-full">★ Featured</span>
          <CategoryBadge category={blog.category} />
        </div>
        <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3 font-serif group-hover:text-[#d4af37] transition-colors">{blog.title}</h2>
        {blog.excerpt && <p className="text-[#b0c4b8] text-sm leading-relaxed mb-6 line-clamp-3">{blog.excerpt}</p>}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <AuthorAvatar name={blog.author} />
            <span className="text-[#b0c4b8] text-sm">{blog.author}</span>
          </div>
          <span className="text-[#b0c4b8]/70 text-xs flex items-center gap-1"><Clock size={11} /> {blog.read_time || 5} min</span>
          <span className="text-[#b0c4b8]/70 text-xs flex items-center gap-1"><Calendar size={11} /> {formatDate(displayDate)}</span>
        </div>
        <div className="inline-flex items-center gap-2 text-[#d4af37] font-semibold text-sm group-hover:gap-3 transition-all">
          Read Article <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

// ── Slim Page Banner ──────────────────────────────────────────────────────────
function PageBanner({ bannerImage, onClose, isVisible }) {
  if (!isVisible || !bannerImage) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-sm mb-10 group border border-gray-200">
      <img src={bannerImage} alt="Wellness Journal Banner" className="w-full h-20 md:h-24 object-cover object-center" />
      {/* Pure black overlay — no blue-green tint */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="text-white text-base">🌿</span>
          <div>
            {/* Gold pill on black bg — maximum contrast */}
            <span className="inline-block bg-[#d4af37] text-black text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
              Wellness Journal
            </span>
            <h2 className="text-white font-serif text-sm md:text-base font-bold leading-tight">
              Natural Therapy &amp; Ayurvedic Wisdom
            </h2>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <X size={11} />
      </button>
    </div>
  );
}

function ComingSoon() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-[#006d39]/10 border border-[#006d39]/20 flex items-center justify-center mb-6">
        <Leaf size={36} className="text-[#006d39]/50" />
      </div>
      <h3 className="text-gray-700 text-2xl font-bold font-serif mb-2">Coming Soon</h3>
      <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
        We&apos;re crafting insightful articles on Ayurveda, wellness, and ancient wisdom. Check back soon!
      </p>
    </div>
  );
}

export default function BlogClient({ blogs }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bannerVisible, setBannerVisible] = useState(true);

  const featuredPost = blogs.find(b => b.is_featured);
  const bannerImage = (blogs.find(b => b.is_featured && b.cover_image) || blogs.find(b => b.cover_image))?.cover_image || '';
  const filtered = activeCategory === 'All' ? blogs : blogs.filter(b => b.category === activeCategory);
  const gridPosts = activeCategory === 'All' ? blogs.filter(b => !b.is_featured) : filtered;
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? blogs.length : blogs.filter(b => b.category === cat).length;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="bg-vedicana-dark-green text-white py-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf size={18} className="text-[#d4af37]" />
            <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">VediCana</span>
            <Leaf size={18} className="text-[#d4af37] scale-x-[-1]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3 leading-tight">
            {/* "Wellness" explicitly gold — no ambiguity */}
            <span className="text-[#d4af37]">Wellness</span>{' '}
            <span className="text-white">Journal</span>
          </h1>
          <div className="w-16 h-0.5 bg-[#d4af37] mx-auto mb-3 rounded-full" />
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Ancient wisdom for modern living — explore Ayurveda, holistic wellness &amp; nature&apos;s remedies
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* ── Page Banner Slot ──────────────────────────────────────────── */}
        <PageBanner
          bannerImage={bannerImage}
          isVisible={bannerVisible && !!bannerImage}
          onClose={() => setBannerVisible(false)}
        />

        {/* ── Featured Post ─────────────────────────────────────────────── */}
        {featuredPost && activeCategory === 'All' && <FeaturedPost blog={featuredPost} />}

        {/* ── Category Filter Tabs ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === cat
                  ? 'bg-[#006d39] text-white shadow-lg shadow-[#006d39]/20'
                  : 'bg-white text-gray-600 hover:bg-[#006d39]/10 hover:text-[#006d39] border border-gray-200'
              }`}
            >
              {cat}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {categoryCounts[cat] || 0}
              </span>
            </button>
          ))}
          <span className="ml-auto text-gray-400 text-sm self-center">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Blog Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.length === 0 ? (
            <ComingSoon />
          ) : (
            gridPosts.map(blog => <BlogCard key={blog.id} blog={blog} />)
          )}
        </div>

      </section>
    </main>
  );
}
