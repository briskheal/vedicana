'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, User, Tag, Leaf } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const CATEGORY_STYLES = {
  Wellness:       { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Ayurveda:       { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  Recipes:        { bg: 'bg-orange-100',  text: 'text-orange-700'  },
  Lifestyle:      { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  'Product News': { bg: 'bg-sky-100',     text: 'text-sky-700'     },
};

// Minimal markdown-to-HTML renderer for display
function renderMarkdown(content) {
  if (!content) return '';
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3 font-serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4 font-serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-800 mt-8 mb-4 font-serif">$1</h1>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#006d39] underline hover:text-[#b8962e] transition-colors" target="_blank" rel="noopener">$1</a>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="ml-5 mb-1 text-gray-700 list-disc">$1</li>')
    // Paragraphs (blank lines)
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

export default function BlogPostPage({ params }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [slug, setSlug] = useState(null);

  // Resolve params (Next.js 15+ async params)
  useEffect(() => {
    params instanceof Promise
      ? params.then(p => setSlug(p.slug))
      : setSlug(params.slug);
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setBlog(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#006d39]/30 border-t-[#006d39] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading article...</p>
        </div>
      </main>
    );
  }

  if (notFound || !blog) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-[#006d39]/10 flex items-center justify-center mx-auto mb-6">
            <Leaf size={36} className="text-[#006d39]/50" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">Post Not Found</h1>
          <p className="text-gray-500 mb-8">This article may have been moved or is no longer available.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#006d39] text-white rounded-full font-semibold hover:bg-[#005a2e] transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const catStyle = CATEGORY_STYLES[blog.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const displayDate = blog.published_at || blog.createdAt;
  const tags = Array.isArray(blog.tags) ? blog.tags : [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero / Cover */}
      <div className="relative bg-gradient-to-b from-[#0a1f0e] to-[#0d2813] min-h-[320px] md:min-h-[420px] flex flex-col justify-end overflow-hidden">
        {blog.cover_image && (
          <>
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f0e] via-[#0a1f0e]/60 to-transparent" />
          </>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#b0c4b8] hover:text-white text-sm font-medium mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
          </Link>

          {/* Category */}
          {blog.category && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 ${catStyle.bg} ${catStyle.text}`}>
              {blog.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white font-serif leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-[#b0c4b8] text-sm">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006d39] to-[#b8962e] flex items-center justify-center text-white text-xs font-bold">
                {(blog.author || 'V')[0].toUpperCase()}
              </div>
              {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDate(displayDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {blog.read_time || 5} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {blog.views || 0} views
            </span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-[#006d39] text-xl font-medium italic border-l-4 border-[#006d39] pl-6 mb-10 leading-relaxed">
            {blog.excerpt}
          </p>
        )}

        {/* Content */}
        {blog.content ? (
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p class="text-gray-700 leading-relaxed mb-4">${renderMarkdown(blog.content)}</p>`
            }}
          />
        ) : (
          <p className="text-gray-400 italic text-center py-16">Content coming soon...</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag size={16} className="text-[#006d39]" />
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-[#006d39]/10 text-[#006d39] rounded-full text-xs font-semibold border border-[#006d39]/20 hover:bg-[#006d39]/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#006d39] text-white rounded-full font-semibold hover:bg-[#005a2e] transition-colors shadow-lg shadow-[#006d39]/20 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Wellness Journal
          </Link>
        </div>
      </article>
    </main>
  );
}
