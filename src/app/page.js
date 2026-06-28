import { ArrowRight, Leaf, ShieldCheck, Heart, ShoppingCart, Star, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Product from '../models/Product.js';
import AddToCartButton from '../components/AddToCartButton';
import HeroSlider from '../components/HeroSlider';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import DynamicCalendarGraphic from '../components/DynamicCalendarGraphic';
import PopularCategory from '../models/PopularCategory.js';
import HeroSlide from '../models/HeroSlide.js';
import Certification from '../models/Certification.js';
import NewsletterForm from '../components/NewsletterForm';

// Cache page at Edge for 1 hour to reduce Fast Origin Transfer
export const revalidate = 3600;

const homeCategories = [
  {
    name: 'Wellness Remedies',
    slug: 'wellness',
    description: 'Immunity & health tonics',
    bgColor: 'bg-[#eaf4e6] hover:bg-[#deeed7] border-[#d8ecd0]',
    iconColor: 'text-emerald-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.003 9.003 0 008.354-5.646 9.003 9.003 0 00-16.708 0A9.003 9.003 0 0012 21z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    )
  },
  {
    name: 'Ayurvedic Powders',
    slug: 'powder-cure',
    description: 'Pure single herb powders',
    bgColor: 'bg-[#fff6e5] hover:bg-[#ffeed0] border-[#ffe6ba]',
    iconColor: 'text-amber-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: 'Saffron & Honey',
    slug: 'honey-corner',
    description: '100% pure raw honeys',
    bgColor: 'bg-[#fef9e7] hover:bg-[#fdf2cc] border-[#fbeba3]',
    iconColor: 'text-yellow-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    )
  },
  {
    name: 'Hair Care Remedies',
    slug: 'hair-care',
    description: 'Herbal shampoo & oils',
    bgColor: 'bg-[#e6f4f2] hover:bg-[#d5eeea] border-[#cae6e1]',
    iconColor: 'text-teal-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-1.813-5.096m1.813 5.096h6M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    name: 'Body Massage Care',
    slug: 'body-care',
    description: 'Therapeutic pain oils',
    bgColor: 'bg-[#e3f2fd] hover:bg-[#d0e8fc] border-[#bbdefb]',
    iconColor: 'text-sky-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-sky-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    )
  },
  {
    name: "Women's Health",
    slug: 'womens-health',
    description: 'Hygiene & wellness',
    bgColor: 'bg-[#fce4ec] hover:bg-[#fad1df] border-[#f8bbd0]',
    iconColor: 'text-rose-700 bg-white/85 shadow-sm',
    svg: (
      <svg className="w-8 h-8 text-rose-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    )
  }
];

const testimonials = [
  {
    name: "Prithwiraj Sarkar",
    date: "3. September, 2024",
    rating: 5,
    message: "Your medicines are magical...  I shall recommend it to others as well.... Brilliant indeed!!"
  },
  {
    name: "Sisir Sahu",
    date: "22. August, 2024",
    rating: 5,
    message: "Never tried herbal products before. However foung Eloova Herbal Shampoo good for my personal use to take care of hair loss. Certainly I look forward to try few more products of VediCana Organics."
  },
  {
    name: "Dinesh Mishra",
    date: "22. August, 2024",
    rating: 5,
    message: "I wanted to try a product called Sencial Body Massage Oil to protect my body from fatigue and tiredness. Believe me I am happy with the product that give me time to nurture my body and throw toxins out. I am sure to try more products of VediCana."
  },
  {
    name: "Manoranjan Mishra",
    date: "22. August, 2024",
    rating: 5,
    message: "Appreciate timely delivery and quality of products. Wishing VediCana Organics all the success in their venture."
  },
  {
    name: "Mayank Dwivedi",
    date: "22. August, 2024",
    rating: 5,
    message: "Hard-core pharma guy, rarely believe herbal products till I found VediCana Kwath, the herbal tea in VediCana Store. Love the taste and quality and combination of herbs. Really refreshing in the morning to improve my immunity and detoxify my system. Wish to explore more products and I am loving it."
  }
];

const premiumPastelStyles = [
  { bg: 'bg-[#eaf4e6] hover:bg-[#deeed7] border-[#d8ecd0] hover:border-emerald-200', text: 'text-emerald-700' },
  { bg: 'bg-[#fff6e5] hover:bg-[#ffeed0] border-[#ffe6ba] hover:border-amber-200', text: 'text-amber-700' },
  { bg: 'bg-[#e6f4f2] hover:bg-[#d5eeea] border-[#cbe6e2] hover:border-teal-200', text: 'text-teal-700' },
  { bg: 'bg-[#f4e8f7] hover:bg-[#ebd2f2] border-[#e2cce9] hover:border-purple-200', text: 'text-purple-700' },
  { bg: 'bg-[#eef2f7] hover:bg-[#e0e7f1] border-[#d2dceb] hover:border-blue-200', text: 'text-blue-700' },
  { bg: 'bg-[#fce4ec] hover:bg-[#fad1df] border-[#f8bbd0] hover:border-rose-200', text: 'text-rose-700' }
];

export default async function Home() {
  // Fetch data from PostgreSQL concurrently
  let products = [];
  let popularCategories = [];
  let slides = [];
  let certifications = [];

  try {
    const [dbProducts, dbPopular, dbSlides, dbCerts] = await Promise.all([
      Product.findAll({ where: { is_featured: true }, limit: 3, attributes: ['id', 'title', 'slug', 'image', 'price', 'sale_price', 'description'] }),
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
  }

  const fallbackCertifications = [
    {
      title: 'WHO GMP',
      image: 'https://cdn-icons-png.flaticon.com/512/2912/2912795.png'
    },
    {
      title: 'Organic',
      image: 'https://cdn-icons-png.flaticon.com/512/892/892926.png'
    },
    {
      title: 'Cruelty Free',
      image: 'https://cdn-icons-png.flaticon.com/512/825/825590.png'
    },
    {
      title: 'Chemical Free',
      image: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png'
    },
    {
      title: 'Sustainable',
      image: 'https://cdn-icons-png.flaticon.com/512/2913/2913564.png'
    },
    {
      title: 'SSL Secure',
      image: 'https://cdn-icons-png.flaticon.com/512/2504/2504932.png'
    }
  ];

  // Fallback to static category options if DB is empty
  const categoriesToRender = popularCategories.length > 0 ? popularCategories : homeCategories;
  const certificationsToRender = certifications.length > 0 ? certifications : fallbackCertifications;

  // Dynamic calendar component is now imported directly in the JSX

  return (
    <div>
      {/* Hero Slider Section */}
      <HeroSlider slides={slides} />

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-0 animate-fade-in-up delay-200">
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-[#eaf4e6] rounded-full flex items-center justify-center text-vedicana-green mb-4">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Natural</h3>
              <p className="text-gray-500">Pure botanical extracts without harmful chemicals</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-[#fff6e5] rounded-full flex items-center justify-center text-vedicana-gold mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Ayush Certified</h3>
              <p className="text-gray-500">Tested and verified by Ministry of Ayush</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="w-16 h-16 bg-[#e6f4f2] rounded-full flex items-center justify-center text-vedicana-teal mb-4">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Cruelty Free</h3>
              <p className="text-gray-500">Ethically sourced and never tested on animals</p>
            </div>
          </div>
        </div>
      </section>


      {/* Popular Categories Grid Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-vedicana-gold font-semibold tracking-wider uppercase text-sm block mb-2">Explore By Remedy</span>
            <h2 className="text-4xl font-serif text-vedicana-dark-green mb-4">Popular Categories</h2>
            <div className="w-20 h-1 bg-vedicana-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoriesToRender.map((cat, idx) => {
              const style = premiumPastelStyles[idx % premiumPastelStyles.length];
              const isDynamic = !cat.svg;
              const shapeClass = cat.shape === 'square' ? 'rounded-xl' : 'rounded-full';

              return (
                <Link 
                  key={idx} 
                  href={`/shop?category=${cat.slug}`}
                  className={`p-6 rounded-2xl border transition-all duration-300 group flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 ${isDynamic ? style.bg : cat.bgColor}`}
                >
                  {/* Icon/Photo Container */}
                  <div className={`w-14 h-14 bg-white flex items-center justify-center mb-5 transform group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden ${shapeClass} ${isDynamic ? 'p-1 border border-gray-100' : cat.iconColor}`}>
                    {isDynamic ? (
                      <div className="relative w-full h-full">
                        <Image src={cat.image} alt={cat.name} fill sizes="56px" className="object-contain" />
                      </div>
                    ) : (
                      cat.svg
                    )}
                  </div>
                  <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-gray-900 mb-1.5 group-hover:text-vedicana-green transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {cat.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products from Database */}
      <section className="py-12 bg-gray-55">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div>
              <span className="text-vedicana-gold font-semibold tracking-wider uppercase text-sm block mb-2">Our Bestsellers</span>
              <h2 className="text-4xl font-serif text-vedicana-dark-green">Featured Remedies</h2>
            </div>
            <Link href="/shop" className="group flex items-center text-vedicana-green font-medium mt-4 md:mt-0 hover:text-vedicana-dark-green transition-colors">
              View All Products 
              <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="relative h-72 overflow-hidden bg-gray-100 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:opacity-0 transition-opacity pointer-events-none"></div>
                  {/* Pulling the Base64 WebP image directly from the Database! */}
                  <Link href={`/shop/${product.slug}`} className="w-full h-full bg-white flex items-center justify-center relative">
                    <Image 
                      src={product.image || 'https://via.placeholder.com/800x800?text=No+Image'} 
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {product.sale_price && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Sale
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur text-vedicana-dark-green text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Bestseller
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div 
                    className="text-sm text-gray-500 mb-2 line-clamp-2 prose prose-sm prose-p:my-0" 
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                  />
                  <h3 className="text-2xl font-serif mb-4 text-gray-900 group-hover:text-vedicana-green transition-colors">{product.title}</h3>
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-semibold text-gray-900">₹{product.sale_price || product.price}</span>
                      {product.sale_price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                    <AddToCartButton product={product} variant="icon" />
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <p>No featured products found. Please run the seeder script.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wellness Consultation Promo Section */}
      <section className="py-12 bg-gradient-to-br from-[#f4fcf6] to-white border-t border-b border-gray-100 font-sans overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Live IST Consultation Slots */}
            <div className="lg:col-span-6 order-2 lg:order-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <DynamicCalendarGraphic />
              </div>
            </div>

            {/* Right Column: Copy & Booking Call-to-Action */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="inline-block bg-vedicana-green/10 text-vedicana-green text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                VediCana Advisory
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
                Holistic Wellness Consultations
              </h2>
              <div className="w-12 h-1 bg-vedicana-gold rounded-full"></div>
              <p className="text-gray-600 text-[15px] leading-relaxed text-justify font-light tracking-wide">
                Here at VediCana you can book your time to consult with our Expert Advisors online. From Female Hygiene to Immunity to general health, you can get one-on-one personalized health &amp; wellness advice. Access our dynamic calendar scheduler, pick a date and time slot that suits your schedule, and secure your live Zoom advisory call.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  href="/wellness-consultation"
                  className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs md:text-sm px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  Book a Consultation Call <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* High Quality & Certifications Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block bg-vedicana-green/10 text-vedicana-green text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-sans">
                Our Guarantee
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
                HIGH QUALITY
              </h2>
              <div className="w-12 h-1 bg-vedicana-gold rounded-full"></div>
              <p className="text-gray-600 text-[15px] leading-relaxed text-justify font-light tracking-wide">
                Products available in VediCana Organics platform undergo a rigorous testing phase to confirm they are free from chemicals like Paraben &amp; Sulfate. We choose our manufacture carefully those ensures factory place child-labor and cruelty free with WHO GMP certified. Our consumables are Organic and IQMC certified. Our products sourced from reputable suppliers those adhere to sustainable and ethical practices. We ensure COA(Certificate of Analysis) from Manufactures for each batch manufactured, to improve batch analysis and quality records. Our website is SSL certified to ensure secure online transactions and keep our customers information safe, private &amp; secure.
              </p>
            </div>

            {/* Right Certifications Grid */}
            <div className="lg:col-span-5 bg-gray-55/40 p-8 rounded-2xl border border-gray-100/60 shadow-sm font-sans">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center lg:text-left">
                Verified Certifications
              </h3>
              <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
                {certificationsToRender.map((cert, idx) => (
                  <div 
                    key={cert.id || idx} 
                    className={`flex flex-col items-center space-y-2 text-center group animate-drop-in ${idx > 0 ? `delay-${idx * 100}` : ''}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-150 shadow-sm flex items-center justify-center group-hover:border-vedicana-green group-hover:shadow-md transition-all duration-300 overflow-hidden p-2">
                      <img 
                        src={cert.image} 
                        alt={cert.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600 leading-tight">
                      {cert.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Commendations) Section */}
      <section className="py-12 bg-gray-55 border-t border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-block bg-vedicana-gold/10 text-vedicana-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              COMMENDATIONS
            </h2>
            <div className="w-12 h-1 bg-vedicana-green mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base font-light tracking-wide">
              Messages of trust and wellness from the VediCana family.
            </p>
          </div>

          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Corporate Video Section */}
      <section className="py-12 bg-gradient-to-br from-white to-[#f4fcf6] border-t border-gray-100 font-sans overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Philosophy Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-block bg-vedicana-green/10 text-vedicana-green text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Corporate Video
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
                The Fusion of Tradition & Technology
              </h2>
              <div className="w-12 h-1 bg-vedicana-gold rounded-full"></div>
              <p className="text-gray-600 text-[15px] leading-relaxed text-justify font-light tracking-wide">
                Embark on a visual journey through the heart of VediCana. Our corporate film showcases how we blend ancient Ayurvedic wisdom with modern, scientific manufacturing processes to bring you 100% pure, authentic remedies. From ethical sourcing to rigorous laboratory testing, witness our commitment to quality, purity, and your well-being.
              </p>
              
              <ul className="space-y-3.5 pt-2">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-vedicana-green/10 text-vedicana-green p-1 rounded-full flex-shrink-0 flex items-center justify-center w-6 h-6">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Pure Ayurvedic Heritage</h4>
                    <p className="text-xs text-gray-500 font-light mt-0.5">Time-tested classical recipes from authentic Vedic texts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-vedicana-green/10 text-vedicana-green p-1 rounded-full flex-shrink-0 flex items-center justify-center w-6 h-6">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Modern Scientific Precision</h4>
                    <p className="text-xs text-gray-500 font-light mt-0.5">Formulated and quality-controlled in certified laboratories.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-vedicana-green/10 text-vedicana-green p-1 rounded-full flex-shrink-0 flex items-center justify-center w-6 h-6">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ethically & Sustainably Sourced</h4>
                    <p className="text-xs text-gray-500 font-light mt-0.5">Cruelty-free, child-labor free, and chemical-free guarantee.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Video Player */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black aspect-video group">
                <iframe 
                  src="https://www.youtube.com/embed/45vWWqHxUhE?autoplay=1&mute=1&loop=1&playlist=45vWWqHxUhE"
                  title="VediCana - The Fusion of Tradition and Technology"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0 transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-16 bg-black overflow-hidden border-t border-slate-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Join the VediCana Family</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to receive exclusive offers, early access to new products, and Ayurvedic wellness tips.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
