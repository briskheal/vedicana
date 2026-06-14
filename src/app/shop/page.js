import { ShoppingCart, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import AddToCartButton from '../../components/AddToCartButton';
import { Op } from 'sequelize';

export const revalidate = 3600;

export default async function Shop({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams?.category;
  const searchQuery = resolvedSearchParams?.q;
  const limitParam = resolvedSearchParams?.limit; // '12', '24', '36', 'all'
  const pageParam = resolvedSearchParams?.page || '1';
  const isAllActive = !categorySlug;

  const includeCategory = {
    model: Category,
    required: !!categorySlug,
  };
  
  if (categorySlug) {
    includeCategory.where = { slug: categorySlug };
  }

  const whereClause = { is_active: true }; // Only show active/visible products
  if (searchQuery) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${searchQuery}%` } },
      { description: { [Op.iLike]: `%${searchQuery}%` } }
    ];
  }

  // Pagination & limit setups
  let limit = 12;
  if (limitParam === 'all') {
    limit = null;
  } else if (limitParam) {
    limit = parseInt(limitParam, 10) || 12;
  }

  const page = parseInt(pageParam, 10) || 1;
  const offset = limit ? (page - 1) * limit : 0;

  const queryOptions = {
    where: whereClause,
    include: [includeCategory],
    order: [['createdAt', 'DESC']]
  };

  if (limit !== null) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  // Fetch products and categories from Supabase PostgreSQL Database
  const { count, rows: dbProducts } = await Product.findAndCountAll(queryOptions);
  const products = dbProducts.map(p => p.get({ plain: true }));
  
  const dbCategories = await Category.findAll();
  const categories = dbCategories.map(c => c.get({ plain: true }));

  const totalProductsCount = await Product.count();
  const totalPages = limit ? Math.ceil(count / limit) : 1;

  // URL Helper builders
  const getLimitUrl = (newLimit) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (searchQuery) params.set('q', searchQuery);
    params.set('limit', newLimit.toString());
    params.set('page', '1');
    return `/shop?${params.toString()}`;
  };

  const getPageUrl = (p) => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (searchQuery) params.set('q', searchQuery);
    if (limitParam) params.set('limit', limitParam.toString());
    params.set('page', p.toString());
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="bg-[#f9f9fa] min-h-screen pb-24">
      
      {/* Header */}
      <div className="bg-vedicana-dark-green py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-serif text-white mb-2">
            {searchQuery ? `Search: "${searchQuery}"` : 'Our Wellness Catalog'}
          </h1>
          <div className="w-16 h-0.5 bg-vedicana-gold mx-auto mb-3"></div>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto">
            Explore our range of pure, authentic Ayurvedic remedies. Carefully formulated to heal, protect, and rejuvenate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-[13px] font-sans font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-3">
              <Filter size={14} className="text-vedicana-green" /> Categories
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a 
                  href="/shop" 
                  className={`flex items-center gap-2 font-sans text-[13px] tracking-wider transition-all duration-300 ${
                    isAllActive 
                      ? 'text-vedicana-green pl-1 font-bold' 
                      : 'text-gray-850 font-medium hover:text-vedicana-green hover:pl-1'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isAllActive ? 'bg-vedicana-gold scale-100' : 'bg-transparent scale-0 w-0'}`}></span>
                  All Products <span className="text-gray-550 font-medium">({totalProductsCount})</span>
                </a>
              </li>
              {categories.map(cat => {
                const isActive = categorySlug === cat.slug;
                return (
                  <li key={cat.id} className="border-t border-gray-100/50 pt-2.5">
                    <a 
                      href={`/shop?category=${cat.slug}`} 
                      className={`flex items-center gap-2 font-sans text-[13px] tracking-wider transition-all duration-300 ${
                        isActive 
                          ? 'text-vedicana-green pl-1 font-bold' 
                          : 'text-gray-850 font-medium hover:text-vedicana-green hover:pl-1'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-vedicana-gold scale-100' : 'bg-transparent scale-0 w-0'}`}></span>
                      {cat.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Shop Control Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input Bar */}
            <form action="/shop" method="GET" className="flex items-center w-full sm:w-auto relative max-w-xs">
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {limitParam && <input type="hidden" name="limit" value={limitParam} />}
              <input 
                type="text" 
                name="q" 
                defaultValue={searchQuery || ''}
                placeholder="Search products..." 
                className="w-full bg-gray-55/50 border border-gray-200 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-vedicana-green font-medium text-gray-800"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vedicana-green cursor-pointer">
                <Search size={14} />
              </button>
            </form>

            {/* Results count display */}
            <span className="text-xs text-gray-500 font-medium">
              Showing {products.length} of {count} products
            </span>

            {/* Sizing options: 12, 24, 36, All */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Show:</span>
              <div className="flex rounded-lg border border-gray-150 p-0.5 bg-gray-50/50">
                {[12, 24, 36, 'all'].map((lim) => {
                  const label = lim === 'all' ? 'All' : lim;
                  const isCurrent = lim === 'all' ? limit === null : limit === lim;
                  return (
                    <a
                      key={lim}
                      href={getLimitUrl(lim)}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                        isCurrent 
                          ? 'bg-vedicana-green text-white shadow-sm' 
                          : 'text-gray-650 hover:text-vedicana-green'
                      }`}
                    >
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="relative h-72 overflow-hidden bg-gray-100 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:opacity-0 transition-opacity pointer-events-none"></div>
                  {/* Now pulling standard image via URL */}
                  <a href={`/shop/${product.slug}`} className="w-full h-full bg-vedicana-bg flex items-center justify-center relative">
                    <Image 
                      src={product.image || 'https://via.placeholder.com/800x800?text=No+Image'} 
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  {product.sale_price && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Sale
                      </span>
                    </div>
                  )}
                  {product.Category && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-white/90 backdrop-blur text-vedicana-dark-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        {product.Category.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <a href={`/shop/${product.slug}`} className="block">
                    <h3 className="text-xl font-serif mb-3 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-1">{product.title}</h3>
                  </a>
                  <div 
                    className="text-sm text-gray-550 mb-6 line-clamp-2" 
                    dangerouslySetInnerHTML={{ 
                      __html: (product.short_description && product.short_description.replace(/<[^>]*>/g, '').trim().length > 0)
                        ? product.short_description 
                        : product.description 
                    }} 
                  />
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-vedicana-green">₹{product.sale_price || product.price}</span>
                      {product.sale_price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                    <AddToCartButton product={product} variant="small" />
                  </div>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">No products found.</p>
              </div>
            )}
          </div>

          {/* Pagination Skip Page Layout */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 border-t border-gray-100 pt-8">
              <a 
                href={page > 1 ? getPageUrl(page - 1) : '#'} 
                className={`p-2 rounded-full border flex items-center justify-center transition-all ${
                  page > 1 
                    ? 'border-gray-200 hover:border-vedicana-green text-gray-700 bg-white hover:shadow-sm' 
                    : 'border-gray-150 text-gray-300 pointer-events-none bg-gray-50/20'
                }`}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </a>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a 
                  key={p} 
                  href={getPageUrl(p)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    p === page 
                      ? 'bg-vedicana-green border-vedicana-green text-white shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-750 hover:border-vedicana-green'
                  }`}
                >
                  {p}
                </a>
              ))}

              <a 
                href={page < totalPages ? getPageUrl(page + 1) : '#'} 
                className={`p-2 rounded-full border flex items-center justify-center transition-all ${
                  page < totalPages 
                    ? 'border-gray-200 hover:border-vedicana-green text-gray-700 bg-white hover:shadow-sm' 
                    : 'border-gray-150 text-gray-300 pointer-events-none bg-gray-50/20'
                }`}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
