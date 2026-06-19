import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/shop/[slug]/page.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Link import
if (!content.includes("import Link from 'next/link';")) {
  content = content.replace("import { notFound } from 'next/navigation';", "import { notFound } from 'next/navigation';\nimport Link from 'next/link';");
}

// 2. Replace breadcrumb links
content = content.replace(/<a href="\/" className="hover:text-vedicana-green">Home<\/a>/, '<Link href="/" className="hover:text-vedicana-green">Home</Link>');
content = content.replace(/<a href="\/shop" className="hover:text-vedicana-green">Shop<\/a>/, '<Link href="/shop" className="hover:text-vedicana-green">Shop</Link>');

fs.writeFileSync(file, content);
console.log("Successfully updated shop/[slug]/page.js");
