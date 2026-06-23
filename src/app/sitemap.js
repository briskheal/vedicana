import Product from '../models/Product.js';
import Category from '../models/Category.js';
import DiscoverPage from '../models/DiscoverPage.js';

export default async function sitemap() {
  const baseUrl = 'https://www.vedicana.com';

  // Base static routes
  const staticRoutes = [
    '',
    '/shop',
    '/blog',
    '/contact',
    '/career',
    '/prakriti',
    '/wellness-consultation',
    '/privacy-policy',
    '/return-policy',
    '/terms-and-conditions'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/shop' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch dynamic content
  let productRoutes = [];
  let categoryRoutes = [];
  let discoverRoutes = [];

  try {
    const [products, categories, discoverPages] = await Promise.all([
      Product.findAll({ attributes: ['slug', 'updatedAt'], raw: true }),
      Category.findAll({ attributes: ['slug', 'updatedAt'], raw: true }),
      DiscoverPage.findAll({ where: { is_active: true }, attributes: ['slug', 'updatedAt'], raw: true })
    ]);

    productRoutes = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/shop?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    discoverRoutes = discoverPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  } catch (error) {
    console.error('Failed to fetch data for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...discoverRoutes];
}
