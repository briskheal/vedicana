import React from 'react';
import { notFound } from 'next/navigation';
import DiscoverPage from '../../models/DiscoverPage.js';
import SafeHtmlRenderer from '../../components/SafeHtmlRenderer.js';
import ChakraWheel from '../../components/ChakraWheel.js';
import ChakraReadingWheel from '../../components/ChakraReadingWheel.js';
import MantraPlayer from '../../components/MantraPlayer.js';
import fs from 'fs';
import path from 'path';

export const revalidate = 3600;


export default async function DynamicDiscoverPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Search for the page matching this slug in PostgreSQL
  const pageData = await DiscoverPage.findOne({
    where: { slug, is_active: true }
  });

  let title = '';
  let content = '';

  if (!pageData) {
    if (slug === 'terms-conditions') {
      const configPath = path.join(process.cwd(), 'public/settings_config.json');
      let companySettings = {
        terms_conditions: '1. All sales of Ayurvedic formulations are final.\n2. Any manufacturing defect claims must be filed within 7 days of delivery.\n3. Product efficacy may vary depending on individual Prakriti.'
      };
      if (fs.existsSync(configPath)) {
        try {
          const fileData = fs.readFileSync(configPath, 'utf-8');
          companySettings = { ...companySettings, ...JSON.parse(fileData) };
        } catch (e) {
          console.error(e);
        }
      }
      title = 'Terms and Conditions';
      const rawTerms = companySettings.terms_conditions || '';
      // Format as paragraphs
      content = `<div class="space-y-4 text-gray-700 whitespace-pre-line leading-relaxed font-sans text-sm">${rawTerms}</div>`;
    } else {
      notFound();
    }
  } else {
    const page = pageData.get({ plain: true });
    title = page.title;
    content = page.content ? page.content.replace(/\r\n/g, '\n').trim() : '';
  }

  // Check if there is a CHAKRA_WHEEL placeholder
  const parts = content.split('<!-- CHAKRA_WHEEL -->');

  return (
    <div className="bg-[#fbfcfa] min-h-screen pb-24" suppressHydrationWarning={true}>
      
      {/* Page Header Banner */}
      <div className="bg-vedicana-dark-green py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 drop-shadow">{title}</h1>
          <div className="w-20 h-1 bg-[#d4af37] mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-in-up" suppressHydrationWarning={true}>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100/60 hover:shadow-md transition-all duration-300" suppressHydrationWarning={true}>
          <SafeHtmlRenderer html={parts[0]} />
          
          {parts.length > 1 && (
            <div className="flex flex-col gap-12 my-12">
              <div>
                <ChakraReadingWheel />
              </div>
              <div>
                <ChakraWheel />
              </div>
            </div>
          )}
          
          {parts.length > 1 && (
            <SafeHtmlRenderer html={parts.slice(1).join('<!-- CHAKRA_WHEEL -->')} />
          )}
        </div>
      </div>
    </div>
  );
}
