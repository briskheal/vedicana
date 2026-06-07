import React from 'react';
import { notFound } from 'next/navigation';
import DiscoverPage from '../../models/DiscoverPage.js';
import ChakraWheel from '../../components/ChakraWheel';
import SafeHtmlRenderer from '../../components/SafeHtmlRenderer.js';

export const dynamic = 'force-dynamic';

export default async function DiscoverVedicCulturePage() {
  const pageData = await DiscoverPage.findOne({
    where: { slug: 'discover-vedic-culture', is_active: true }
  });

  if (!pageData) {
    notFound();
  }

  const page = pageData.get({ plain: true });
  const sanitizedContent = page.content ? page.content.replace(/\r\n/g, '\n').trim() : '';

  // Dynamically inject placeholder for ChakraWheel above the Seven Chakras heading
  let contentToRender = sanitizedContent;
  const splitIndex = sanitizedContent.indexOf('The Seven Chakras of Higher Consciousness');
  if (splitIndex !== -1) {
    const lastTagIndex = sanitizedContent.lastIndexOf('<', splitIndex);
    if (lastTagIndex !== -1) {
      contentToRender = 
        sanitizedContent.substring(0, lastTagIndex) + 
        '<div id="chakra-wheel-placeholder"></div>' + 
        sanitizedContent.substring(lastTagIndex);
    }
  }

  return (
    <div className="bg-[#fbfcfa] min-h-screen pb-24" suppressHydrationWarning={true}>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-in-up" suppressHydrationWarning={true}>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100/60 hover:shadow-md transition-all duration-300" suppressHydrationWarning={true}>
          <SafeHtmlRenderer html={contentToRender} />
          {/* ChakraWheel will render client-side via React Portal into the #chakra-wheel-placeholder div */}
          <ChakraWheel />
        </div>
      </div>
    </div>
  );
}
