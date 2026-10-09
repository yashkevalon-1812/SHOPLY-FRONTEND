import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ProductCard } from '../components/product/ProductCard';
import { handleImageError } from '../utils/imageHelper';
import {
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  Award,
  Zap,
  Clock,
  ChevronRight,
  TrendingUp,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    image: '/hero-everything-store.jpg',
    kicker: 'ALL CATEGORIES / ONE DESTINATION',
    titleLine1: 'Everything You Need,',
    titleAccent: 'All in',
    titleLine2: 'One Place',
    subtitle: 'From fashion and electronics to home essentials and more — discover top quality products, unbeatable deals and a better way to shop, all at Shoply.',
    badgeTitle: 'Better Choices',
    badgeSubtitle: 'Brighter Days ✨',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    id: 2,
    image: '/hero-studio.jpg',
    kicker: 'CURATED STUDIO / EXCLUSIVE DROPS',
    titleLine1: 'Elevate Your Daily Living,',
    titleAccent: 'Crafted with',
    titleLine2: 'Artisanal Precision',
    subtitle: 'Explore limited studio releases, designer electronics, and bespoke lifestyle essentials engineered for uncompromising quality.',
    badgeTitle: 'Curated Essentials',
    badgeSubtitle: 'Studio Edition ✨',
    ctaText: 'Explore Studio',
    ctaLink: '/shop',
  },
  {
    id: 3,
    image: '/hero-fashion.jpg',
    kicker: 'CURATED FASHION / TRENDING APPAREL',
    titleLine1: 'Define Your Modern Style,',
    titleAccent: 'Tailored for',
    titleLine2: 'Bold Confidence',
    subtitle: 'From seasonal runway collections to everyday statement pieces — discover wardrobe staples designed to turn heads everywhere you go.',
    badgeTitle: 'Seasonal Picks',
    badgeSubtitle: 'Urban Luxury 🔥',
    ctaText: 'Shop Fashion',
    ctaLink: '/shop?category=Fashion',
  },
  {
    id: 4,
    image: '/hero-lifestyle.jpg',
    kicker: 'HOME & LIVING / ARTISANAL DECOR',
    titleLine1: 'Transform Your Home Space,',
    titleAccent: 'Curated for',
    titleLine2: 'Cozy Comfort',
    subtitle: 'Create your sanctuary with warm textures, handcrafted homeware, and functional aesthetic accents made for inspired everyday living.',
    badgeTitle: 'Modern Spaces',
    badgeSubtitle: 'Cozy Living 🌿',
    ctaText: 'Shop Home & Living',
    ctaLink: '/shop?category=Home%20%26%20Kitchen',
  },
];

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Seamless continuous auto-scroller for hero background slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Live countdown timer for Mega Sale & Flash Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!flashDeals || flashDeals.length === 0) return;

    const calculateTime = () => {
      const withExpiry = flashDeals.filter((p) => p.flashSaleExpiresAt);
      let targetTime;
      if (withExpiry.length > 0) {
        targetTime = Math.min(...withExpiry.map((p) => new Date(p.flashSaleExpiresAt).getTime()));
      } else {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        targetTime = midnight.getTime();
      }

      const diff = targetTime - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [flashDeals]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, flashRes, catRes] = await Promise.all([
          api.get('/products/featured').catch(() => ({ data: [] })),
          api.get('/products/flash-deals').catch(() => ({ data: [] })),
          api.get('/products/categories').catch(() => ({ data: [] })),
        ]);
        setFeaturedProducts(Array.isArray(featRes.data) ? featRes.data : []);
        setFlashDeals(Array.isArray(flashRes.data) ? flashRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch (err) {
        console.error('Error fetching curated drops:', err);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans transition-colors duration-200">
      {/* Responsive Background Image Object Positioning */}
      <style>{`
        .hero-bg-img {
          object-position: 70% center;
        }
        @media (min-width: 640px) {
          .hero-bg-img {
            object-position: 75% center;
          }
        }
        @media (min-width: 1024px) {
          .hero-bg-img {
            object-position: 82% center;
          }
        }
      `}</style>

      {/* =========================================================================
          1. FULL-BLEED HERO SHOWCASE (Responsive, spacious, studio on desktop)
         ========================================================================= */}
      <section className="relative overflow-hidden w-full flex flex-col justify-between min-h-[510px] sm:min-h-[550px] md:min-h-[calc(100vh-98px)] md:h-[calc(100vh-98px)] py-8 sm:py-9 md:py-0 bg-[#faf7f2] dark:bg-[#0c1017] border-b border-stone-200/80 dark:border-slate-800 transition-colors">
        {/* Full-bleed Studio Background Image Slider (Slides one by one) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Sliding Track */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="min-w-full h-full relative shrink-0">
                <img
                  src={slide.image}
                  alt={slide.kicker}
                  className="w-full h-full object-cover hero-bg-img select-none pointer-events-none"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Subtle gradient scrim on the left to guarantee pristine text contrast while keeping image clear */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/96 via-[#faf7f2]/92 to-[#faf7f2]/94 sm:bg-gradient-to-r sm:from-[#faf7f2] sm:via-[#faf7f2]/90 sm:via-40% sm:to-transparent dark:from-[#0c1017]/96 dark:via-[#0c1017]/92 dark:to-[#0c1017]/90 sm:dark:from-[#0c1017] sm:dark:via-[#0c1017]/95 sm:dark:to-transparent pointer-events-none"></div>
        </div>

        {/* Top-Right Floating Script Badge (Dynamically transitions with active slide) */}
        <div className="absolute top-3.5 sm:top-5 lg:top-7 right-3.5 sm:right-8 lg:right-14 z-20 pointer-events-none select-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-stone-200/80 dark:border-slate-700 shadow-xs transform -rotate-2 sm:-rotate-3 transition-all duration-300">
            <p className="font-serif italic text-[10px] sm:text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
              {heroSlides[currentSlide].badgeTitle} <br />
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {heroSlides[currentSlide].badgeSubtitle}
              </span>
            </p>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 flex-1 flex flex-col justify-center pt-3.5 sm:pt-6 md:pt-0 pb-4 sm:pb-6">
          <div
            key={currentSlide}
            className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-4.5 text-left animate-in fade-in duration-500"
          >
            {/* Category Kicker */}
            <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-amber-700 dark:text-amber-400 sm:text-stone-500 sm:dark:text-stone-400 uppercase transition-all duration-300">
              {heroSlides[currentSlide].kicker}
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-slate-950 dark:text-white tracking-tight leading-[1.18] sm:leading-[1.12]">
              <span className="font-caslon">
                {heroSlides[currentSlide].titleLine1}
              </span>{' '}
              <br />
              <span className="font-serif italic font-normal text-slate-900 dark:text-amber-200">
                {heroSlides[currentSlide].titleAccent}
              </span>{' '}
              <span className="font-caslon">
                {heroSlides[currentSlide].titleLine2}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-800 dark:text-slate-100 max-w-lg font-medium sm:font-normal leading-relaxed">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-2.5">
              <Link
                to={heroSlides[currentSlide].ctaLink || '/shop'}
                className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm px-5.5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-md transition-all hover:scale-105 shrink-0"
              >
                <span>{heroSlides[currentSlide].ctaText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center border border-stone-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white bg-white/75 dark:bg-slate-900/60 backdrop-blur-md text-slate-900 dark:text-slate-200 font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-2xs transition-all hover:bg-white dark:hover:bg-slate-800 shrink-0"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges (Spacious frosted card on mobile, flex row on desktop) */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10 md:pt-4 pb-3 sm:pb-8 lg:pb-12">
          {/* Trust Badges: 2x2 grid on mobile inside a frosted card, flex row on md+ */}
          <div className="p-4 sm:p-5 md:p-0 rounded-2xl bg-white/90 dark:bg-slate-900/90 md:bg-transparent md:dark:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-stone-200/80 dark:border-slate-800/80 md:border-none shadow-xs md:shadow-none">
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-x-5 sm:gap-x-7 gap-y-4 md:gap-7 lg:gap-8">
              {/* Free Shipping */}
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Free Shipping</p>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 font-medium mt-0.5">On orders over ₹1,999</p>
                </div>
              </div>

              <div className="h-8 sm:h-9 w-px bg-stone-300/80 dark:bg-slate-800 hidden md:block"></div>

              {/* Secure Payments */}
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Secure Payments</p>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 font-medium mt-0.5">100% safe & encrypted</p>
                </div>
              </div>

              <div className="h-8 sm:h-9 w-px bg-stone-300/80 dark:bg-slate-800 hidden md:block"></div>

              {/* Easy Returns */}
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Easy Returns</p>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 font-medium mt-0.5">Hassle-free within 7 days</p>
                </div>
              </div>

              <div className="h-8 sm:h-9 w-px bg-stone-300/80 dark:bg-slate-800 hidden md:block"></div>

              {/* Call Support */}
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Call Support</p>
                  <p className="text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 font-medium mt-0.5">24/7 customer service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* =========================================================================
          2. MEGA SALE & FLASH DEALS SECTION (Rendered ONLY when items are available!)
         ========================================================================= */}
      {flashDeals && flashDeals.length > 0 && (
        <section
          id="mega-sale"
          className="py-6 sm:py-8 bg-gradient-to-b from-orange-50/40 via-amber-50/20 to-white dark:from-[#0e1726] dark:via-[#0b1120] dark:to-[#0b1120] border-b border-zinc-200 dark:border-slate-800 transition-colors"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header with Countdown Clock */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/60 text-[11px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1.5 shadow-2xs">
                  <Zap className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>MEGA SALE & FLASH DROPS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="font-bold lowercase text-orange-600 dark:text-orange-300">
                    {flashDeals.length} {flashDeals.length === 1 ? 'deal' : 'deals'} active
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                  Mega Sale & Flash Vault Drops
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-400 mt-0.5">
                  Exclusive limited-time event pricing. Up to 70% off high-demand editions. Quantities strictly limited.
                </p>
              </div>

              {/* Countdown Box */}
              <div className="flex items-center gap-2.5 bg-white dark:bg-[#131d2e] border border-orange-200/80 dark:border-orange-900/40 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors">
                <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="text-[15 px] text-zinc-600 dark:text-slate-300 font-semibold mr-0.5">Sale Ends In:</span>
                <div className="flex items-center gap-1 font-mono text-xs font-black">
                  <span className="bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-slate-700 text-zinc-900 dark:text-white">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-slate-700 text-zinc-900 dark:text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-slate-700 text-orange-600 dark:text-orange-400">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Flash Deals Grid - 4 Cards Per Row on Desktop with spacious gaps */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 xl:gap-8">
              {flashDeals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. CURATED CATEGORIES (Minimal Spacing)
         ========================================================================= */}
      <section className="py-6 sm:py-8 border-b border-zinc-200 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 sm:mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                Directory
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                Shop By Curated Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-950 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              All Categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {categories.slice(0, 6).map((cat, idx) => (
              <Link
                key={cat.name || idx}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-800 hover:border-zinc-400 dark:hover:border-slate-600 transition-all shadow-xs hover:shadow-lg"
              >
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => handleImageError(e, cat.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/25 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {cat.count ? `${cat.count} ${cat.count === 1 ? 'Product' : 'Products'}` : 'Collection'}
                  </p>
                  <h3 className="text-sm font-black text-white">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED MARKETPLACE ICONS (Minimal Spacing)
         ========================================================================= */}
      <section className="py-6 sm:py-8 border-b border-zinc-200 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-4 sm:mb-5">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> High Demand
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                Featured Marketplace Icons
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-slate-700 text-zinc-800 dark:text-slate-200 shadow-xs transition-all"
            >
              <span>Explore Complete Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 dark:text-slate-400" />
            </Link>
          </div>

          {/* Featured Catalog Grid - 4 Cards Per Row on Desktop with spacious gaps */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 xl:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. BRAND ETHOS / WHY SHOPLY (Minimal Spacing)
         ========================================================================= */}
      <section className="py-6 sm:py-8 bg-zinc-50 dark:bg-[#090e1a] transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-6 space-y-3.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                The Shoply Standard
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-tight">
                Designed for Those Who Notice Every Single Micro-Detail.
              </h2>
              <p className="text-zinc-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                In an era of mass commoditization, Shoply stands for bespoke intention. We partner exclusively with certified independent horologists, acoustic engineers, and luxury workshops who honor patient craftsmanship.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Vetted Merchant Guild</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Every seller passes manual verification by our curation panel before a single product is listed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Express Global Logistics</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Automated tracking, insured express customs clearance, and carbon-offset fulfillment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
                alt="Watchmaker craft"
                className="rounded-2xl object-cover h-48 sm:h-56 w-full border border-zinc-200 dark:border-slate-800 shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
                alt="Acoustic craft"
                className="rounded-2xl object-cover h-48 sm:h-56 w-full border border-zinc-200 dark:border-slate-800 shadow-md mt-4 sm:mt-6"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
