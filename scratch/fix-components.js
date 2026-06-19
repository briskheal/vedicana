import fs from 'fs';
import path from 'path';

function fixRelatedProducts() {
  const file = path.join(process.cwd(), 'src/components/RelatedProductsCarousel.js');
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add Link import
  if (!content.includes("import Link from 'next/link';")) {
    content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport Link from 'next/link';");
  }

  // 2. Replace <a href=...> with <Link href=...>
  content = content.replace(/<a href=\{\`\/shop\/\$\{relProduct.slug\}\`\} className="w-full h-full">/g, '<Link href={`/shop/${relProduct.slug}`} className="w-full h-full">');
  content = content.replace(/className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"\n                    \/>\n                  <\/a>/g, 'className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"\n                    />\n                  </Link>');

  content = content.replace(/<a href=\{\`\/shop\/\$\{relProduct.slug\}\`\} className="block">/g, '<Link href={`/shop/${relProduct.slug}`} className="block">');
  content = content.replace(/className="text-base md:text-lg font-serif mb-2 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">\{relProduct.title\}<\/h3>\n                  <\/a>/g, 'className="text-base md:text-lg font-serif mb-2 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">{relProduct.title}</h3>\n                  </Link>');

  // Also handle mobile grid view blocks
  content = content.replace(/<a href=\{\`\/shop\/\$\{relProduct.slug\}\`\} className="w-full h-full">/g, '<Link href={`/shop/${relProduct.slug}`} className="w-full h-full">');
  content = content.replace(/className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"\n                  \/>\n                <\/a>/g, 'className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"\n                  />\n                </Link>');

  content = content.replace(/<a href=\{\`\/shop\/\$\{relProduct.slug\}\`\} className="block">/g, '<Link href={`/shop/${relProduct.slug}`} className="block">');
  content = content.replace(/className="text-sm font-serif mb-1\.5 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">\{relProduct.title\}<\/h3>\n                <\/a>/g, 'className="text-sm font-serif mb-1.5 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">{relProduct.title}</h3>\n                </Link>');

  fs.writeFileSync(file, content);
  console.log("Successfully updated RelatedProductsCarousel.js");
}

function fixProfileDashboard() {
  const file = path.join(process.cwd(), 'src/components/ProfileDashboard.js');
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add Link import
  if (!content.includes("import Link from 'next/link';")) {
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport Link from 'next/link';");
  }

  // 2. Replace <a href=...> with <Link href=...>
  content = content.replace(/<a href="\/admin" className="flex items-center gap-3 px-4 py-3 text-vedicana-gold hover:bg-vedicana-gold\/5 rounded-lg transition-colors font-medium">/g, '<Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-vedicana-gold hover:bg-vedicana-gold/5 rounded-lg transition-colors font-medium">');
  content = content.replace(/Switch to Admin Dashboard\n              <\/a>/g, 'Switch to Admin Dashboard\n              </Link>');

  content = content.replace(/<a href="\/shop" className="inline-block bg-vedicana-green hover:bg-emerald-700 text-white rounded-md px-6 py-2\.5 transition-colors font-medium">/g, '<Link href="/shop" className="inline-block bg-vedicana-green hover:bg-emerald-700 text-white rounded-md px-6 py-2.5 transition-colors font-medium">');
  content = content.replace(/Start Shopping\n                <\/a>/g, 'Start Shopping\n                </Link>');

  fs.writeFileSync(file, content);
  console.log("Successfully updated ProfileDashboard.js");
}

fixRelatedProducts();
fixProfileDashboard();
