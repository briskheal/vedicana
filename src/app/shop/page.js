import { Suspense } from 'react';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import ShopClientGrid from '../../components/ShopClientGrid';

// Cache for 1 hour — this page now renders as static HTML
export const revalidate = 3600;

export default async function Shop() {
  // Fetch ALL active products and categories once at build/revalidation time
  let allProducts = [];
  let categories = [];

  try {
    const [dbProducts, dbCategories] = await Promise.all([
      Product.findAll({
        where: { is_active: true },
        include: [Category],
        order: [['createdAt', 'DESC']],
      }),
      Category.findAll(),
    ]);

    allProducts = JSON.parse(JSON.stringify(dbProducts.map(p => p.get({ plain: true }))));
    categories = JSON.parse(JSON.stringify(dbCategories.map(c => c.get({ plain: true }))));
  } catch (err) {
    console.error('Failed to load shop data:', err);
  }

  return (
    <div className="bg-[#f9f9fa] min-h-screen pb-24">

      {/* Header */}
      <div className="bg-vedicana-dark-green py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-serif text-white mb-2">Our Wellness Catalog</h1>
          <div className="w-16 h-0.5 bg-vedicana-gold mx-auto mb-3"></div>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto">
            Explore our range of pure, authentic Ayurvedic remedies. Carefully formulated to heal, protect, and rejuvenate.
          </p>
        </div>
      </div>

      {/* Client-side grid: handles all filtering, search, and pagination in the browser */}
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading products...</div>}>
        <ShopClientGrid allProducts={allProducts} categories={categories} />
      </Suspense>
    </div>
  );
}
