import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesInfo = [
  { slug: 'about', title: 'About Vedicana' },
  { slug: 'discover-ayurveda', title: 'Discover Ayurveda' },
  { slug: 'discover-vedic-culture', title: 'Discover Vedic Culture' },
  { slug: 'our-ingredients', title: 'Our Ingredients' },
  { slug: 'csr-and-philanthropy', title: 'CSR & Philanthropy' },
  { slug: 'our-team', title: 'Our Team' },
  { slug: 'spiritual-home-omvedic', title: 'Spiritual Home Omvedic' },
  { slug: 'ziva-vedicana', title: 'Ziva Vedicana' }
];

function cleanWordPressHtml(html) {
  let cleaned = html;
  
  // Replace absolute links to live site with local links
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/?["']/g, 'href="/"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/shop\/?["']/g, 'href="/shop"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/checkout\/?["']/g, 'href="/checkout"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/about\/?["']/g, 'href="/about"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/discover-ayurveda\/?["']/g, 'href="/discover-ayurveda"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/discover-vedic-cluture\/?["']/g, 'href="/discover-vedic-culture"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/discover-vedic-culture\/?["']/g, 'href="/discover-vedic-culture"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/our-ingredients\/?["']/g, 'href="/our-ingredients"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/csr-and-philanthropy\/?["']/g, 'href="/csr-and-philanthropy"');
  cleaned = cleaned.replace(/href=["']https:\/\/vedicana\.com\/our-team\/?["']/g, 'href="/our-team"');

  // Replace WordPress image URLs where relevant, or just make sure they point to external sources cleanly
  // Woodmart uses responsive lazy images, make sure src is restored if missing
  cleaned = cleaned.replace(/src=["']data:image\/[^"']+["']\s+data-lazy-src=["']([^"']+)["']/g, 'src="$1"');

  // Remove empty paragraphs or useless comments
  cleaned = cleaned.replace(/<p>&nbsp;<\/p>/g, '');
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  return cleaned;
}

async function generate() {
  const srcDir = path.join(__dirname, '../scratch/discover_pages');
  const appDir = path.join(__dirname, '../src/app');

  for (const page of pagesInfo) {
    const htmlPath = path.join(srcDir, `${page.slug}.html`);
    if (!fs.existsSync(htmlPath)) {
      console.log(`[Error] HTML file not found for ${page.slug} at ${htmlPath}`);
      continue;
    }

    console.log(`Generating Next.js page for: ${page.title} (${page.slug})...`);
    let rawHtml = fs.readFileSync(htmlPath, 'utf8');
    let cleanHtml = cleanWordPressHtml(rawHtml);

    // Escape backticks in HTML to prevent template string breaks
    cleanHtml = cleanHtml.replace(/`/g, '\\`').replace(/\${/g, '\\${');

    const pageCode = `import React from 'react';
import { notFound } from 'next/navigation';
import DiscoverPage from '../../models/DiscoverPage.js';

export const dynamic = 'force-dynamic';

export default async function ${page.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
  const pageData = await DiscoverPage.findOne({
    where: { slug: '${page.slug}', is_active: true }
  });

  if (!pageData) {
    notFound();
  }

  const page = pageData.get({ plain: true });

  return (
    <div className="bg-[#fbfcfa] min-h-screen pb-24">
      {/* Page Header Banner */}
      <div className="bg-vedicana-dark-green py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow">{page.title}</h1>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-in-up">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100/60 hover:shadow-md transition-all duration-300">
          <div 
            className="discover-content"
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        </div>
      </div>
    </div>
  );
}
`;

    const pageDir = path.join(appDir, page.slug);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    const pagePath = path.join(pageDir, 'page.js');
    fs.writeFileSync(pagePath, pageCode, 'utf8');
    console.log(`  [SUCCESS] Wrote Next.js page component to ${pagePath}`);
  }
}

generate();
