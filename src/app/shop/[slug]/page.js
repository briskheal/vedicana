import Product from '../../../models/Product.js';
import Category from '../../../models/Category.js';
import { ShoppingCart, ShieldCheck, Leaf, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCartButton from '../../../components/AddToCartButton';
import ProductGallery from '../../../components/ProductGallery';
import ProductTabs from '../../../components/ProductTabs';
import ProductDetailInfo from '../../../components/ProductDetailInfo';
import RelatedProductsCarousel from '../../../components/RelatedProductsCarousel';
import { Op } from 'sequelize';


export const revalidate = 3600;

export default async function ProductDetails({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Fetch product from Postgres by slug with Category details
  const dbProduct = await Product.findOne({
    where: { slug },
    include: [{ model: Category }]
  });

  if (!dbProduct) {
    notFound();
  }
  
  const product = dbProduct.get({ plain: true });

  // Fetch related products in the same category (up to 12)
  const relatedDbProducts = await Product.findAll({
    where: {
      categoryId: product.categoryId || null,
      id: { [Op.ne]: product.id }
    },
    limit: 12,
    include: [{ model: Category }]
  });

  const relatedProducts = relatedDbProducts.map(p => p.get({ plain: true }));


  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-vedicana-green">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-vedicana-green">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery (Left) */}
          <div className="w-full md:w-1/2 relative">
            {product.sale_price && (
              <div className="absolute top-6 left-6 z-20">
                <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-md">
                  Sale
                </span>
              </div>
            )}
            <ProductGallery 
              title={product.title} 
              primaryImage={product.image} 
              gallery={product.gallery} 
            />
          </div>

          {/* Product Info (Right) */}
          <ProductDetailInfo product={product} category={product.Category} bundleProduct={relatedProducts.length > 0 ? relatedProducts[0] : null} />
        </div>


        {/* Product Details Tabs (Description, Specification, Additional Info, Moderated Reviews) */}
        <ProductTabs 
          productSlug={product.slug}
          description={product.description}
          specification={product.specification}
          additionalInfo={product.additional_info}
        />

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-gray-150/80 pt-16 font-sans">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-950 mb-10 text-center font-bold tracking-tight">
              Related Remedies
            </h2>
            <RelatedProductsCarousel products={relatedProducts} />
          </div>
        )}

      </div>
    </div>
  );
}
