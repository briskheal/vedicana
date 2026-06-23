export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/', '/profile/', '/cart/', '/checkout/'],
    },
    sitemap: 'https://www.vedicana.com/sitemap.xml',
  };
}
