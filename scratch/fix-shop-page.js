import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/shop/page.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Link import
if (!content.includes("import Link from 'next/link';")) {
  content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport Link from 'next/link';");
}

// 2. Fix Promise.all
const promiseBlockOld = `  // Fetch products and categories from Supabase PostgreSQL Database
  const { count, rows: dbProducts } = await Product.findAndCountAll(queryOptions);
  const products = dbProducts.map(p => p.get({ plain: true }));
  
  const dbCategories = await Category.findAll();
  const categories = dbCategories.map(c => c.get({ plain: true }));

  const totalProductsCount = await Product.count();`;

const promiseBlockNew = `  // Fetch products and categories concurrently
  const [
    { count, rows: dbProducts },
    dbCategories,
    totalProductsCount
  ] = await Promise.all([
    Product.findAndCountAll(queryOptions),
    Category.findAll(),
    Product.count()
  ]);

  const products = dbProducts.map(p => p.get({ plain: true }));
  const categories = dbCategories.map(c => c.get({ plain: true }));`;

content = content.replace(promiseBlockOld, promiseBlockNew);

// 3. Replace `<a href` with `<Link href` for category pills
content = content.replace(/<a \n                    key=\{cat\.id\}\n                    href=\{\`\/shop\?category=\$\{cat\.slug\}\`\}/g, '<Link \n                    key={cat.id}\n                    href={`/shop?category=${cat.slug}`}');
content = content.replace(/\{cat\.name\}\n                  <\/a>/g, '{cat.name}\n                  </Link>');

// For the "All" category pill
content = content.replace(/<a \n                    href="\/shop"/g, '<Link \n                    href="/shop"');
content = content.replace(/All Remedies <span className="text-xs opacity-60 ml-1">\(\{totalProductsCount\}\)<\/span>\n                  <\/a>/g, 'All Remedies <span className="text-xs opacity-60 ml-1">({totalProductsCount})</span>\n                  </Link>');

// Replace `<a href` with `<Link href` for Product Image
content = content.replace(/<a href=\{\`\/shop\/\$\{product\.slug\}\`\} className="w-full h-full/g, '<Link href={`/shop/${product.slug}`} className="w-full h-full');
content = content.replace(/className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-500"\n                    \/>\n                  <\/a>/g, 'className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-500"\n                    />\n                  </Link>');

// Replace `<a href` with `<Link href` for Product Title
content = content.replace(/<a href=\{\`\/shop\/\$\{product\.slug\}\`\} className="block">/g, '<Link href={`/shop/${product.slug}`} className="block">');
content = content.replace(/className="text-lg font-serif mb-2 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">\{product\.title\}<\/h3>\n                  <\/a>/g, 'className="text-lg font-serif mb-2 text-gray-900 group-hover:text-vedicana-green transition-colors line-clamp-2 leading-tight">{product.title}</h3>\n                  </Link>');

// Replace pagination links
content = content.replace(/<a\n                            key=\{p\}\n                            href=\{getPageUrl\(p\)\}/g, '<Link\n                            key={p}\n                            href={getPageUrl(p)}');
content = content.replace(/\{p\}\n                          <\/a>/g, '{p}\n                          </Link>');

content = content.replace(/<a href=\{getPageUrl\(page - 1\)\}/g, '<Link href={getPageUrl(page - 1)}');
content = content.replace(/<ChevronLeft size=\{16\} \/>\n                          <\/a>/g, '<ChevronLeft size={16} />\n                          </Link>');

content = content.replace(/<a href=\{getPageUrl\(page \+ 1\)\}/g, '<Link href={getPageUrl(page + 1)}');
content = content.replace(/<ChevronRight size=\{16\} \/>\n                          <\/a>/g, '<ChevronRight size={16} />\n                          </Link>');

fs.writeFileSync(file, content);
console.log("Successfully updated shop/page.js");
