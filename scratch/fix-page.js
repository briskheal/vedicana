import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/page.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Link import
if (!content.includes("import Link from 'next/link';")) {
  content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport Link from 'next/link';");
}

// 2. Fix Promise.all
const promiseBlockOld = `  // Fetch actual products from our custom PostgreSQL Database
  const dbProducts = await Product.findAll({
    where: { is_featured: true },
    limit: 3,
  });
  const products = dbProducts.map(p => p.get({ plain: true }));

  // Fetch popular categories from PostgreSQL
  let popularCategories = [];
  try {
    const dbPopular = await PopularCategory.findAll({
      order: [['createdAt', 'ASC']]
    });
    popularCategories = dbPopular.map(c => c.get({ plain: true }));
  } catch (err) {
    console.error('Failed to load popular categories:', err);
  }

  // Fetch active hero slides from PostgreSQL
  let slides = [];
  try {
    const dbSlides = await HeroSlide.findAll({
      where: { is_active: true },
      order: [
        ['order_index', 'ASC'],
        ['id', 'ASC']
      ]
    });
    slides = dbSlides.map(s => s.get({ plain: true }));
  } catch (err) {
    console.error('Failed to load custom hero slides:', err);
  }

  // Fetch active certifications stamps from PostgreSQL
  let certifications = [];
  try {
    const dbCerts = await Certification.findAll({
      order: [
        ['order_index', 'ASC'],
        ['id', 'ASC']
      ]
    });
    certifications = dbCerts.map(c => c.get({ plain: true }));
  } catch (err) {
    console.error('Failed to load certifications:', err);
  }`;

const promiseBlockNew = `  // Fetch data from PostgreSQL concurrently
  let products = [];
  let popularCategories = [];
  let slides = [];
  let certifications = [];

  try {
    const [dbProducts, dbPopular, dbSlides, dbCerts] = await Promise.all([
      Product.findAll({ where: { is_featured: true }, limit: 3 }),
      PopularCategory.findAll({ order: [['createdAt', 'ASC']] }),
      HeroSlide.findAll({ where: { is_active: true }, order: [['order_index', 'ASC'], ['id', 'ASC']] }),
      Certification.findAll({ order: [['order_index', 'ASC'], ['id', 'ASC']] })
    ]);

    products = dbProducts.map(p => p.get({ plain: true }));
    popularCategories = dbPopular.map(c => c.get({ plain: true }));
    slides = dbSlides.map(s => s.get({ plain: true }));
    certifications = dbCerts.map(c => c.get({ plain: true }));
  } catch (err) {
    console.error('Failed to load homepage data:', err);
  }`;

content = content.replace(promiseBlockOld, promiseBlockNew);

// 3. Replace <a href=...> with <Link href=...> 
// Find all `<a href=...` strings and replace them manually where appropriate.

content = content.replace(/<a \n                  key=\{idx\} \n                  href=\{\`\/shop\?category=\$\{cat.slug\}\`\}/g, '<Link \n                  key={idx} \n                  href={`/shop?category=${cat.slug}`}');
content = content.replace(/\{cat.description\}\n                  <\/p>\n                <\/a>/g, '{cat.description}\n                  </p>\n                </Link>');

content = content.replace(/<a href="\/shop" className="group flex items-center text-vedicana-green/g, '<Link href="/shop" className="group flex items-center text-vedicana-green');
content = content.replace(/View All Products \n              <ArrowRight size=\{18\} className="ml-2 transform group-hover:translate-x-1 transition-transform" \/>\n            <\/a>/, 'View All Products \n              <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />\n            </Link>');

content = content.replace(/<a href=\{\`\/shop\/\$\{product.slug\}\`\} className="w-full h-full/g, '<Link href={`/shop/${product.slug}`} className="w-full h-full');
content = content.replace(/className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-500"\n                    \/>\n                  <\/a>/g, 'className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-500"\n                    />\n                  </Link>');

content = content.replace(/<a \n                  href="\/wellness-consultation"\n                  className="bg-vedicana-green hover:bg-emerald-700 text-white/g, '<Link \n                  href="/wellness-consultation"\n                  className="bg-vedicana-green hover:bg-emerald-700 text-white');
content = content.replace(/Book a Consultation Call <ArrowRight size=\{16\} \/>\n                <\/a>/, 'Book a Consultation Call <ArrowRight size={16} />\n                </Link>');

fs.writeFileSync(file, content);
console.log("Successfully updated page.js");
