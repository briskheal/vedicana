import "./globals.css";
import { Lato, Cardo } from 'next/font/google';
import { Suspense } from 'react';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const cardo = Cardo({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
import { Search, User, ChevronDown } from 'lucide-react';

const Facebook = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const Instagram = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);

const Linkedin = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);

const Youtube = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.097-2.099C19.56 3.65 12 3.65 12 3.65s-7.56 0-9.4.414c-1.022.273-1.825 1.077-2.097 2.099C.1 8.002.1 12 .1 12s0 3.998.403 5.837c.272 1.022 1.075 1.826 2.097 2.1C4.44 20.35 12 20.35 12 20.35s7.56 0 9.4-.414c1.022-.274 1.825-1.078 2.097-2.1.402-1.839.402-5.837.402-5.837s0-3.998-.402-5.837zm-14.288 9.61V8.228L15.5 12l-6.29 3.773z" /></svg>
);

const Twitter = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);
import CartIcon from '../components/CartIcon';
import SearchBar from '../components/SearchBar';
import LanguageTranslator from '../components/LanguageTranslator';
import AccessibilityAssistant from '../components/AccessibilityAssistant';
import { CartProvider } from '../context/CartContext';
import SpinWheelModal from '../components/SpinWheelModal';
import MobileNav from '../components/MobileNav';
import DiscoverPage from '../models/DiscoverPage.js';
import Category from '../models/Category.js';
import FooterLink from '../models/FooterLink.js';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import PageTransition from '../components/PageTransition';
import ConditionalLayout from '../components/ConditionalLayout';
import Script from 'next/script';
import AnalyticsTracker from '../components/AnalyticsTracker';

import CookieBanner from '../components/CookieBanner';

export const metadata = {
  title: "VediCana | Tradition Re-emerged",
  description: "100% Pure Ayurvedic and Natural Products. Carefully formulated to heal, protect, and rejuvenate.",
  metadataBase: new URL('https://www.vedicana.com'),
  openGraph: {
    title: "VediCana | Tradition Re-emerged",
    description: "100% Pure Ayurvedic and Natural Products.",
    url: "https://www.vedicana.com",
    siteName: "VediCana Organics",
    images: [{ url: "/logo.webp", width: 800, height: 600, alt: "VediCana Logo" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VediCana | Tradition Re-emerged",
    description: "100% Pure Ayurvedic and Natural Products.",
    images: ["/logo.webp"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }) {

  // Check if store logo exists & retrieve height settings config
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
    sweden_office: '',
    ga_id: '',
    fb_pixel_id: ''
  };
  try {
    const data = await fs.promises.readFile(settingsConfigPath, 'utf8');
    const config = JSON.parse(data);
    companyDetails = { ...companyDetails, ...config };
  } catch (e) {}

  let discoverPages = [];
  let categories = [];
  let footerQuickLinks = [];
  let footerPolicies = [];
  
  try {
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
  }

  return (
    <html lang="en" className={`scroll-smooth ${lato.variable} ${cardo.variable}`} suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VediCana Organics",
              "url": "https://www.vedicana.com",
              "logo": "https://www.vedicana.com/logo.webp",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8249169354",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              }
            })
          }}
        />
        {companyDetails.ga_id && (
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${companyDetails.ga_id}`} strategy="afterInteractive" />
        )}
        {companyDetails.ga_id && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${companyDetails.ga_id}');
            `}
          </Script>
        )}
        {companyDetails.fb_pixel_id && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${companyDetails.fb_pixel_id}');
            `}
          </Script>
        )}
        <Script id="copy-protection" strategy="afterInteractive">
          {`
            // Disable Right Click
            document.addEventListener('contextmenu', event => event.preventDefault());

            // Disable Keyboard Shortcuts
            document.addEventListener('keydown', function(e) {
              // Prevent Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
              if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
              }
              // Prevent Command+C etc on Mac
              if (e.metaKey && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
              }
              // Prevent F12 (DevTools)
              if (e.key === 'F12') {
                e.preventDefault();
              }
            });
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen overflow-x-hidden w-full relative font-sans" suppressHydrationWarning={true}>
        <Suspense fallback={null}>
          <AnalyticsTracker gaId={companyDetails.ga_id} fbPixelId={companyDetails.fb_pixel_id} />
        </Suspense>
        <CartProvider>
          {/* Skip directly to main content for screen readers / keyboard users */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-vedicana-green text-white px-4 py-2.5 rounded-lg font-bold z-[99999] text-xs uppercase tracking-wider shadow-md"
          >
            Skip to main content
          </a>

          <CookieBanner />

          <ConditionalLayout
            header={
              <header key="global-header" className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
              <nav className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                  {/* Logo */}
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="flex items-center">
                      {logoExists ? (
                        <img 
                          src="/logo.webp" 
                          alt="VediCana" 
                          style={{ height: `${logoHeight}px` }}
                          className="w-auto object-contain max-h-[50px] md:max-h-[72px]"
                        />
                      ) : (
                        <span className="text-3xl font-serif font-bold text-vedicana-green tracking-tight">
                          VediCana
                          <span className="text-vedicana-gold text-4xl leading-none">.</span>
                        </span>
                      )}
                    </Link>
                  </div>
                  
                  {/* Desktop Menu */}
                  <div className="hidden lg:flex space-x-8 items-center">
                    <Link href="/" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Home</Link>
                    <Link href="/shop" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Shop</Link>
                    <Link href="/blog" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Blog</Link>
                    
                    {/* Discover Dropdown */}
                    <div className="relative group py-8">
                      <button className="flex items-center text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">
                        Discover <ChevronDown size={14} className="ml-1" />
                      </button>
                      <div className="absolute top-20 left-0 w-64 bg-white shadow-xl border border-gray-100 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top group-hover:scale-100 scale-95">
                        <div className="py-2">
                          <Link 
                            href="/prakriti" 
                            className="block px-5 py-3 font-sans text-xs uppercase tracking-wider text-vedicana-gold hover:bg-gray-50 hover:text-vedicana-green border-b border-gray-100 transition-colors font-semibold"
                          >
                            Ayurvedic Quiz
                          </Link>
                          {discoverPages.filter(p => !['payment-security', 'pricing-policy', 'cancelation-policy', 'shipping-policy', 'return-policy', 'privacy-policy', 'terms-and-conditions'].includes(p.slug)).map((page) => (
                            <Link 
                              key={page.id} 
                              href={`/${page.slug}`} 
                              className="block px-5 py-3 font-sans text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-vedicana-green transition-colors font-medium"
                            >
                              {page.title}
                            </Link>
                          ))}
                          {discoverPages.length === 0 && (
                            <span className="block px-5 py-2.5 text-sm text-gray-400 italic">No pages configured</span>
                          )}
                        </div>
                      </div>

                    </div>

                    <Link href="/contact" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Contact Us</Link>
                    <Link href="/career" className="text-gray-700 hover:text-vedicana-green font-bold text-sm uppercase tracking-wide transition-colors">Careers</Link>
                  </div>

                  {/* Right Side Icons & Socials */}
                  <div className="flex items-center">
                    {/* Wellness Consultation CTA Button */}
                    <div className="hidden md:flex items-center mr-6 pr-6 border-r border-gray-200">
                      <Link 
                        href="/wellness-consultation" 
                        className="bg-vedicana-green hover:bg-vedicana-dark-green text-white px-4 py-1.5 rounded-full font-serif text-[11px] md:text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 text-center"
                      >
                        Wellness Consultation
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-5">
                      <LanguageTranslator />
                      <SearchBar />
                      <Link 
                        href="/profile" 
                        title="Sign Up/Login" 
                        className="text-gray-700 hover:text-vedicana-green transition-colors"
                      >
                        <User size={20} />
                      </Link>
                      <CartIcon />
                      <MobileNav discoverPages={discoverPages} />
                    </div>
                  </div>
                </div>
              </nav>
            </header>
            }
            spinWheel={<SpinWheelModal key="global-spinwheel" />}
            footer={
              <div key="global-footer" className="global-footer-container">
                <footer className="bg-black text-slate-300 pt-6 pb-4 border-t-[6px] border-vedicana-gold font-sans antialiased">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
                  
                  {/* Brand & Address Column */}
                  <div className="col-span-1 md:col-span-2 space-y-4 max-w-md">
                    <h2 className="text-3xl font-serif text-white mb-2 flex items-center">
                      {logoExists ? (
                        <img 
                          src="/logo.webp" 
                          alt="VediCana" 
                          style={{ height: `${logoHeight}px` }}
                          className="w-auto object-contain brightness-0 invert"
                        />
                      ) : (
                        <span>
                          VediCana<span className="text-vedicana-gold">.</span>
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-400/80 leading-relaxed text-xs md:text-sm font-light tracking-wide">
                      Tradition Re-emerged. Bringing 100% Pure, Authentic Ayurvedic remedies to your doorstep. Carefully formulated to heal, protect, and rejuvenate.
                    </p>
                    <div className="text-xs text-slate-400/70 space-y-1 leading-relaxed pt-1 font-light tracking-wide">
                      <p className="font-medium text-slate-200 tracking-wide text-xs">{companyDetails.company_name}</p>
                      <p>Address: {companyDetails.company_address}</p>
                      {companyDetails.marketed_by && <p className="mt-1 text-[11px] text-slate-350"><span className="font-semibold text-slate-200">Marketed By:</span> {companyDetails.marketed_by}</p>}
                      {companyDetails.marketing_office_addr && <p className="text-[11px] text-slate-400">Marketing Office: {companyDetails.marketing_office_addr}</p>}
                      <p className="pt-1">Phone: {companyDetails.company_phone}</p>
                      <p>Email: {companyDetails.company_email}</p>
                    </div>

                  </div>

                  {/* Quick Links Column */}
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-white/95 mb-2 uppercase tracking-wider">Quick Links</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <Link href="/prakriti" className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-medium tracking-wide text-[13px] md:text-sm border-b border-white/5 pb-1 block">
                          Ayurvedic Quiz (Prakriti)
                        </Link>
                      </li>
                      <li>
                        <Link href="/wellness-consultation" className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-medium tracking-wide text-[13px] md:text-sm border-b border-white/5 pb-1 block">
                          Wellness Consultation
                        </Link>
                      </li>
                      <li>
                        <Link href="/track-order" className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-medium tracking-wide text-[13px] md:text-sm border-b border-white/5 pb-1 block">
                          Track Order
                        </Link>
                      </li>
                      {footerQuickLinks.map((link) => (
                        <li key={link.id}>
                          <Link href={link.url} className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-light tracking-wide text-[13px] md:text-sm">
                            {link.title}
                          </Link>
                        </li>
                      ))}
                      {footerQuickLinks.length === 0 && (
                        <span className="text-slate-500 italic text-xs">No links configured</span>
                      )}
                    </ul>
                  </div>

                  {/* Policies Column */}
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-white/95 mb-2 uppercase tracking-wider">Policies</h4>
                    <ul className="space-y-1 text-sm">
                      {footerPolicies.map((link) => (
                        <li key={link.id}>
                          <Link href={link.url} className="text-slate-300/85 hover:text-vedicana-gold transition-colors font-light tracking-wide text-[13px] md:text-sm">
                            {link.title}
                          </Link>
                        </li>
                      ))}
                      {footerPolicies.length === 0 && (
                        <span className="text-slate-500 italic text-xs">No policies configured</span>
                      )}
                    </ul>

                    {/* Be Sociable Section */}
                    {Object.values(socialLinks).some(url => url) && (
                      <div className="mt-4 pt-3 border-t border-slate-900">
                        <h4 className="text-xs md:text-sm font-semibold text-white/95 mb-2 uppercase tracking-wider">Be Sociable</h4>
                        <div className="flex items-center space-x-2">
                          {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-[#1877F2] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm" title="Facebook">
                              <Facebook size={14} />
                            </a>
                          )}
                          {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-[#E4405F] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm" title="Instagram">
                              <Instagram size={14} />
                            </a>
                          )}
                          {socialLinks.linkedin && (
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-[#0A66C2] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm" title="LinkedIn">
                              <Linkedin size={14} />
                            </a>
                          )}
                          {socialLinks.youtube && (
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-[#FF0000] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm" title="YouTube">
                              <Youtube size={14} />
                            </a>
                          )}
                          {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-[#1DA1F2] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm" title="Twitter / X">
                              <Twitter size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* FDA & Ayush Disclaimer */}
                <div className="border-t border-slate-900 pt-4 pb-1 text-[10px] sm:text-[11px] text-slate-500/80 leading-relaxed text-center font-light tracking-wide">
                  <p className="max-w-5xl mx-auto">
                    Products and benefits not evaluated by FDA. Herbal products are approved by Ayush, taken by our manufacturing partners. Information in website is educational purpose only and not a substitute for medical advice, diagnosis or treatment. For more clarity about your personal needs do consult a qualified Health Care Practitioner.
                  </p>
                </div>

                {/* Secure payments & copyright */}
                <div className="border-t border-slate-900 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-light tracking-wide">
                  <p>&copy; {new Date().getFullYear()} VediCana Organics. All rights reserved.</p>
                  <div className="flex space-x-4 mt-4 md:mt-0 items-center text-[11px]">
                    <span className="text-slate-400/80">100% Secure Payments</span>
                    <span className="bg-slate-950 px-2.5 py-1 rounded text-slate-400/80 border border-slate-900">COD Available</span>
                  </div>
                </div>

              </div>
            </footer>
            {/* Global Dynamic Floating WhatsApp Widget */}
            <a 
              href={`https://wa.me/${(socialLinks.whatsapp || '9437272884').replace(/[^0-9]/g, '')}?text=`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="fixed bottom-6 right-6 z-[999] bg-[#25D366] hover:bg-[#20ba5a] text-white w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 shadow-[#25d366]/40 flex items-center justify-center group"
              title="Chat with VediCana Support"
            >
              {/* Slide-out tooltip */}
              <div className="absolute right-16 top-1/2 -translate-y-1/2 mr-3 bg-[#FCF9F2] text-vedicana-green text-xs font-serif font-semibold py-2 px-4 rounded-xl shadow-lg border border-[#e6c280]/35 whitespace-nowrap opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none hidden md:block select-none shadow-[#25d366]/5">
                Chat with us
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FCF9F2] border-r border-t border-[#e6c280]/35 rotate-45"></div>
              </div>
              {/* WhatsApp custom SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
              </svg>
            </a>
            <AccessibilityAssistant />
          </div>
            }
          >
            <main id="main-content" className="flex-grow flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
          </ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}
