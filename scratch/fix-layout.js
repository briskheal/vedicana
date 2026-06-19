import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/app/layout.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Link import
if (!content.includes("import Link from 'next/link';")) {
  content = content.replace("import path from 'path';", "import path from 'path';\nimport Link from 'next/link';");
}

// 2. Fix fs calls
const fsBlockOld = `  // Check if store logo exists & retrieve height settings config
  const logoPath = path.join(process.cwd(), 'public', 'logo.webp');
  const logoExists = fs.existsSync(logoPath);

  const logoConfigPath = path.join(process.cwd(), 'public', 'logo_config.json');
  let logoHeight = 48; // default fallback (48px)
  if (fs.existsSync(logoConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(logoConfigPath, 'utf8'));
      if (config.height) {
        logoHeight = Number(config.height);
      }
    } catch (e) {
      console.error('Failed to parse logo height config:', e);
    }
  }

  // Retrieve social config settings
  const socialConfigPath = path.join(process.cwd(), 'public', 'social_config.json');
  let socialLinks = {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    twitter: '',
    whatsapp: ''
  };
  if (fs.existsSync(socialConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(socialConfigPath, 'utf8'));
      socialLinks = { ...socialLinks, ...config };
    } catch (e) {
      console.error('Failed to parse social links config:', e);
    }
  }

  // Retrieve settings config for company details
  const settingsConfigPath = path.join(process.cwd(), 'public', 'settings_config.json');
  let companyDetails = {
    company_name: 'VediCana Organics',
    company_address: 'Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India',
    company_phone: '+91 8249169354 | +91 8878923337',
    company_email: 'info@vedicana.com',
    company_gst: '',
    sweden_office: ''
  };
  if (fs.existsSync(settingsConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(settingsConfigPath, 'utf8'));
      companyDetails = { ...companyDetails, ...config };
    } catch (e) {
      console.error('Failed to parse settings config:', e);
    }
  }`;

const fsBlockNew = `  // Check if store logo exists & retrieve height settings config
  const logoPath = path.join(process.cwd(), 'public', 'logo.webp');
  let logoExists = false;
  try {
    await fs.promises.access(logoPath);
    logoExists = true;
  } catch (e) {}

  const logoConfigPath = path.join(process.cwd(), 'public', 'logo_config.json');
  let logoHeight = 48; // default fallback (48px)
  try {
    const data = await fs.promises.readFile(logoConfigPath, 'utf8');
    const config = JSON.parse(data);
    if (config.height) {
      logoHeight = Number(config.height);
    }
  } catch (e) {}

  // Retrieve social config settings
  const socialConfigPath = path.join(process.cwd(), 'public', 'social_config.json');
  let socialLinks = {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    twitter: '',
    whatsapp: ''
  };
  try {
    const data = await fs.promises.readFile(socialConfigPath, 'utf8');
    const config = JSON.parse(data);
    socialLinks = { ...socialLinks, ...config };
  } catch (e) {}

  // Retrieve settings config for company details
  const settingsConfigPath = path.join(process.cwd(), 'public', 'settings_config.json');
  let companyDetails = {
    company_name: 'VediCana Organics',
    company_address: 'Vraj Raj Complex, Ambamata-Temple Road, Karelibaug, Vadodara-390018, Gujarat, India',
    company_phone: '+91 8249169354 | +91 8878923337',
    company_email: 'info@vedicana.com',
    company_gst: '',
    sweden_office: ''
  };
  try {
    const data = await fs.promises.readFile(settingsConfigPath, 'utf8');
    const config = JSON.parse(data);
    companyDetails = { ...companyDetails, ...config };
  } catch (e) {}`;

content = content.replace(fsBlockOld, fsBlockNew);

// 3. Fix Promise.all
const promiseBlockOld = `  try {
    discoverPages = await DiscoverPage.findAll({
      where: { is_active: true },
      order: [['createdAt', 'ASC']],
      raw: true
    });
    categories = await Category.findAll({
      order: [['name', 'ASC']],
      raw: true
    });
    footerQuickLinks = await FooterLink.findAll({
      where: { section: 'quick_links' },
      order: [['order_index', 'ASC'], ['title', 'ASC']],
      raw: true
    });
    footerPolicies = await FooterLink.findAll({
      where: { section: 'policies' },
      order: [['order_index', 'ASC'], ['title', 'ASC']],
      raw: true
    });
  } catch (err) {
    console.error('Failed to load dynamic navigation menus:', err);
  }`;

const promiseBlockNew = `  try {
    [discoverPages, categories, footerQuickLinks, footerPolicies] = await Promise.all([
      DiscoverPage.findAll({
        where: { is_active: true },
        order: [['createdAt', 'ASC']],
        raw: true
      }),
      Category.findAll({
        order: [['name', 'ASC']],
        raw: true
      }),
      FooterLink.findAll({
        where: { section: 'quick_links' },
        order: [['order_index', 'ASC'], ['title', 'ASC']],
        raw: true
      }),
      FooterLink.findAll({
        where: { section: 'policies' },
        order: [['order_index', 'ASC'], ['title', 'ASC']],
        raw: true
      })
    ]);
  } catch (err) {
    console.error('Failed to load dynamic navigation menus:', err);
  }`;

content = content.replace(promiseBlockOld, promiseBlockNew);

// 4. Replace <a href=...> with <Link href=...> (excluding external links)
const aTagsToReplace = [
  '<a href="/" className="flex items-center">',
  '</a>', // for the logo
  '<a href="/" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Home</a>',
  '<a href="/shop" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Shop</a>',
  '<a href="/blog" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Blog</a>',
  '<a \n                            href="/prakriti" \n                            className="block px-5 py-3 font-sans text-xs uppercase tracking-wider text-vedicana-gold hover:bg-gray-50 hover:text-vedicana-green border-b border-gray-100 transition-colors font-semibold"\n                          >\n                            Ayurvedic Quiz\n                          </a>',
  '<a \n                              key={page.id} \n                              href={`/${page.slug}`} \n                              className="block px-5 py-3 font-sans text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-vedicana-green transition-colors font-medium"\n                            >\n                              {page.title}\n                            </a>',
  '<a href="/contact" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Contact Us</a>',
  '<a href="/career" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Careers</a>',
  '<a \n                        href="/wellness-consultation" \n                        className="bg-vedicana-green hover:bg-vedicana-dark-green text-white px-4 py-1.5 rounded-full font-serif text-[11px] md:text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 text-center"\n                      >\n                        Wellness Consultation\n                      </a>',
  '<a \n                        href="/profile" \n                        title="Sign Up/Login" \n                        className="text-gray-700 hover:text-vedicana-green transition-colors"\n                      >\n                        <User size={20} />\n                      </a>',
  '<a href="/prakriti" className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-medium tracking-wide text-[13px] md:text-sm border-b border-white/5 pb-1 block">\n                          Ayurvedic Quiz (Prakriti)\n                        </a>',
  '<a href="/wellness-consultation" className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-medium tracking-wide text-[13px] md:text-sm border-b border-white/5 pb-1 block">\n                          Wellness Consultation\n                        </a>',
  '<a href={link.url} className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-light tracking-wide text-[13px] md:text-sm">\n                            {link.title}\n                          </a>'
];

content = content.replace(/<a href="\/" className="flex items-center">/, '<Link href="/" className="flex items-center">');
content = content.replace(/<\/a>\n                  <\/div>/, '</Link>\n                  </div>'); // specific to logo
content = content.replace(/<a href="\/" className="text-gray-700/g, '<Link href="/" className="text-gray-700');
content = content.replace(/Home<\/a>/, 'Home</Link>');

content = content.replace(/<a href="\/shop" className="text-gray-700/g, '<Link href="/shop" className="text-gray-700');
content = content.replace(/Shop<\/a>/, 'Shop</Link>');

content = content.replace(/<a href="\/blog" className="text-gray-700/g, '<Link href="/blog" className="text-gray-700');
content = content.replace(/Blog<\/a>/, 'Blog</Link>');

content = content.replace(/<a \n                            href="\/prakriti"/g, '<Link \n                            href="/prakriti"');
content = content.replace(/Ayurvedic Quiz\n                          <\/a>/, 'Ayurvedic Quiz\n                          </Link>');

content = content.replace(/<a \n                              key=\{page.id\} \n                              href=\{\`\/\$\{page.slug\}\`\}/g, '<Link \n                              key={page.id} \n                              href={`/${page.slug}`}');
content = content.replace(/\{page.title\}\n                            <\/a>/g, '{page.title}\n                            </Link>');

content = content.replace(/<a href="\/contact" className="text-gray-700/g, '<Link href="/contact" className="text-gray-700');
content = content.replace(/Contact Us<\/a>/, 'Contact Us</Link>');

content = content.replace(/<a href="\/career" className="text-gray-700/g, '<Link href="/career" className="text-gray-700');
content = content.replace(/Careers<\/a>/, 'Careers</Link>');

content = content.replace(/<a \n                        href="\/wellness-consultation"/g, '<Link \n                        href="/wellness-consultation"');
content = content.replace(/Wellness Consultation\n                      <\/a>/, 'Wellness Consultation\n                      </Link>');

content = content.replace(/<a \n                        href="\/profile"/g, '<Link \n                        href="/profile"');
content = content.replace(/<User size=\{20\} \/>\n                      <\/a>/, '<User size={20} />\n                      </Link>');

content = content.replace(/<a href="\/prakriti" className="text-slate-300/g, '<Link href="/prakriti" className="text-slate-300');
content = content.replace(/Ayurvedic Quiz \(Prakriti\)\n                        <\/a>/, 'Ayurvedic Quiz (Prakriti)\n                        </Link>');

content = content.replace(/<a href="\/wellness-consultation" className="text-slate-300/g, '<Link href="/wellness-consultation" className="text-slate-300');
content = content.replace(/Wellness Consultation\n                        <\/a>/, 'Wellness Consultation\n                        </Link>');

content = content.replace(/<a href=\{link.url\} className="text-slate-300\/85/g, '<Link href={link.url} className="text-slate-300/85');
content = content.replace(/\{link.title\}\n                          <\/a>/g, '{link.title}\n                          </Link>');

// We are intentionally NOT replacing the social links, or WhatsApp, or external links.

fs.writeFileSync(file, content);
console.log("Successfully updated layout.js");
