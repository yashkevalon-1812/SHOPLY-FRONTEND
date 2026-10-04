import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ProductCard } from '../components/product/ProductCard';
import { MegaSaleBanner } from '../components/common/MegaSaleBanner';
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
} from 'lucide-react';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);

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
      {/* Sitewide Mega Sale Banner (Managed by Admin) */}
      <MegaSaleBanner />

      {/* Inline styles for exact 1-screen viewport fit below the sticky navbar */}
      <style>{`
        .hero-viewport-height {
          height: calc(100vh - 96px);
          min-height: calc(100vh - 96px);
          height: calc(100dvh - 96px);
          min-height: calc(100dvh - 96px);
          width: 100%;
        }
        @media (min-width: 768px) {
          .hero-viewport-height {
            height: calc(100vh - 98px);
            min-height: calc(100vh - 98px);
            height: calc(100dvh - 98px);
            min-height: calc(100dvh - 98px);
          }
        }
      `}</style>

      {/* =========================================================================
          1. FULL-BLEED HERO SHOWCASE (Fits 100vh Screen Fold Cleanly with Navbar)
         ========================================================================= */}
      <section
        className="hero-viewport-height relative overflow-hidden w-full flex flex-col justify-between bg-[#faf7f2] dark:bg-[#0c1017] border-b border-stone-200/80 dark:border-slate-800 transition-colors"
      >
        {/* Full-bleed Studio Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-everything-store.jpg"
            alt="Everything You Need, All in One Place - Shoply Showcase"
            className="w-full h-full object-cover object-[70%_center] sm:object-[75%_center] lg:object-[82%_center] select-none pointer-events-none"
          />
          {/* Subtle gradient scrim on the left to guarantee pristine text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf7f2] via-[#faf7f2]/90 sm:via-[#faf7f2]/75 via-40% to-transparent dark:from-[#0c1017] dark:via-[#0c1017]/95 sm:dark:via-[#0c1017]/85 pointer-events-none"></div>
        </div>

        {/* Top-Right Floating "Better Choices Brighter Days" Script Badge */}
        <div className="absolute top-3 sm:top-5 lg:top-7 right-4 sm:right-8 lg:right-14 z-20 pointer-events-none select-none">
          <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-stone-200/80 dark:border-slate-700 shadow-md transform -rotate-3">
            <p className="font-serif italic text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
              Better Choices <br />
              <span className="text-amber-600 dark:text-amber-400 font-bold">Brighter Days ✨</span>
            </p>
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 flex-1 flex flex-col justify-center py-2 sm:py-4">
          <div className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4 text-left">
            {/* Category Kicker */}
            <div className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase">
              ALL CATEGORIES / ONE DESTINATION
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-slate-950 dark:text-white tracking-tight leading-[1.1]">
              Everything You Need, <br />
              <span className="font-serif italic font-normal text-slate-900 dark:text-amber-200">
                All in
              </span>{' '}
              One Place
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-stone-700 dark:text-slate-300 max-w-lg font-normal leading-relaxed line-clamp-3 sm:line-clamp-none">
              From fashion and electronics to home essentials and more — discover top quality products, unbeatable deals and a better way to shop, all at Shoply.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-md transition-all hover:scale-105 shrink-0"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center border border-stone-400/80 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs text-slate-900 dark:text-slate-200 font-semibold text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all hover:bg-white dark:hover:bg-slate-800 shrink-0"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Trust Badges (Left) & Carousel Controls (Right) */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pb-2 sm:pb-12 pt-1 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {/* Free Shipping */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-slate-900 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Free Shipping</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400">On orders over ₹1,999</p>
              </div>
            </div>

            <div className="h-6 w-px bg-stone-300/80 dark:bg-slate-800 hidden sm:block"></div>

            {/* Secure Payments */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Secure Payments</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400">100% safe & encrypted</p>
              </div>
            </div>

            <div className="h-6 w-px bg-stone-300/80 dark:bg-slate-800 hidden sm:block"></div>

            {/* Easy Returns */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-slate-900 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Easy Returns</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400">Hassle-free within 7 days</p>
              </div>
            </div>

              <div className="h-6 w-px bg-stone-300/80 dark:bg-slate-800 hidden sm:block"></div>

            {/* Call Support */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-slate-900 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Call Support</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400">24/7 customer service</p>
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
                <span className="text-[11px] text-zinc-600 dark:text-slate-300 font-semibold mr-0.5">Sale Ends In:</span>
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

            {/* Flash Deals Grid - 5 Cards Per Row on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
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
              Browse All Categories <ChevronRight className="w-4 h-4" />
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

          {/* Featured Catalog Grid - 5 Cards Per Row on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
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

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Vetted Merchant Guild</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400">Every seller passes manual verification by our curation panel before a single product is listed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Express Global Logistics</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-slate-400">Automated tracking, insured express customs clearance, and carbon-offset fulfillment.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  <span>Read our complete craftsmanship philosophy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
