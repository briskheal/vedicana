'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Eye, Leaf, ArrowRight, User } from 'lucide-react';

const CATEGORIES = ['All', 'Wellness', 'Ayurveda', 'Recipes', 'Lifestyle', 'Product News'];

const CATEGORY_STYLES = {
  Wellness:       { bg: 'bg-emerald-900/60', text: 'text-emerald-300', border: 'border-emerald-700/40' },
  Ayurveda:       { bg: 'bg-amber-900/60',   text: 'text-amber-300',   border: 'border-amber-700/40'   },
  Recipes:        { bg: 'bg-orange-900/60',  text: 'text-orange-300',  border: 'border-orange-700/40'  },
  Lifestyle:      { bg: 'bg-purple-900/60',  text: 'text-purple-300',  border: 'border-purple-700/40'  },
  'Product News': { bg: 'bg-sky-900/60',     text: 'text-sky-300',     border: 'border-sky-700/40'     },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function AuthorAvatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#006d39] to-[#b8962e] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
      {(name || 'V')[0].toUpperCase()}
    </div>
  );
}

function CategoryBadge({ category }) {
  const s = CATEGORY_STYLES[category] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {category}
    </span>
  );
}

function BlogCard({ blog }) {
  const displayDate = blog.published_at || blog.createdAt;
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#006d39]/10 to-[#b8962e]/10 flex-shrink-0">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={40} className="text-[#006d39]/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <CategoryBadge category={blog.category} />
        </div>
        {blog.is_featured && (
          <div className="absolute top-3 right-3 bg-[#b8962e]/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
            ★ Featured
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-900 font-bold text-lg leading-snug mb-2 group-hover:text-[#006d39] transition-colors line-clamp-2 font-serif">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {blog.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AuthorAvatar name={blog.author} />
            <span className="text-gray-600 text-xs font-medium truncate">{blog.author}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px] flex-shrink-0">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {blog.read_time || 5} min
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} /> {blog.views || 0}
            </span>
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
    <Link
      href={`/blog/${blog.slug}`}
      className="group relative rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row mb-14 min-h-[340px] hover:-translate-y-1 transition-transform duration-300"
    >
      {/* Image */}
      <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden bg-gradient-to-br from-[#006d39]/20 to-[#b8962e]/10">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#006d39]/10 to-[#b8962e]/10">
            <Leaf size={60} className="text-[#006d39]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d1f13]/30" />
      </div>

      {/* Content */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#0d1f13] to-[#132b1c] p-8 md:p-10 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-[#b8962e]/20 text-[#b8962e] border border-[#b8962e]/30 text-[11px] font-extrabold px-3 py-1 rounded-full">
            ★ Featured
          </span>
          <CategoryBadge category={blog.category} />
        </div>
        <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3 font-serif group-hover:text-[#b8962e] transition-colors">
          {blog.title}
        </h2>
        {blog.excerpt && (
          <p className="text-[#b0c4b8] text-sm leading-relaxed mb-6 line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <AuthorAvatar name={blog.author} />
            <span className="text-[#b0c4b8] text-sm">{blog.author}</span>
          </div>
          <span className="text-[#b0c4b8]/50 text-xs flex items-center gap-1">
            <Clock size={11} /> {blog.read_time || 5} min read
          </span>
          <span className="text-[#b0c4b8]/50 text-xs flex items-center gap-1">
            <Calendar size={11} /> {formatDate(displayDate)}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 text-[#b8962e] font-semibold text-sm group-hover:gap-3 transition-all">
          Read Article <ArrowRight size={16} />
        </div>
      </div>
    </Link>
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
        We're crafting insightful articles on Ayurveda, wellness, and ancient wisdom. Check back soon!
      </p>
    </div>
  );
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(data => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const featuredPost = blogs.find(b => b.is_featured);
  const filtered = activeCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === activeCategory);
  const gridPosts = activeCategory === 'All'
    ? blogs.filter(b => !b.is_featured)
    : filtered;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#0a1f0e] via-[#0d2813] to-[#0a1f0e] text-white py-20 px-4 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#006d39]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#b8962e]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Leaf size={20} className="text-[#b8962e]" />
            <span className="text-[#b8962e] text-sm font-semibold uppercase tracking-[0.2em]">VediCana</span>
            <Leaf size={20} className="text-[#b8962e] scale-x-[-1]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-serif mb-4 leading-tight">
            Wellness <span className="text-[#b8962e]">Journal</span>
          </h1>
          <p className="text-[#a8c4b0] text-lg md:text-xl leading-relaxed">
            Ancient wisdom for modern living — explore Ayurveda, holistic wellness, and nature's remedies
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {loading ? (
          <div className="flex items-center justify-center py-32 text-[#006d39]/50">
            <div className="w-8 h-8 border-2 border-[#006d39]/30 border-t-[#006d39] rounded-full animate-spin mr-3" />
            Loading articles...
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && activeCategory === 'All' && (
              <FeaturedPost blog={featuredPost} />
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#006d39] text-white shadow-lg shadow-[#006d39]/20'
                      : 'bg-white text-gray-600 hover:bg-[#006d39]/10 hover:text-[#006d39] border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <span className="ml-auto text-gray-400 text-sm self-center">
                {filtered.length} article{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.length === 0 ? (
                <ComingSoon />
              ) : (
                gridPosts.map(blog => <BlogCard key={blog.id} blog={blog} />)
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
