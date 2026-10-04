import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  Truck,
  CheckCircle2,
  Users,
  Globe,
  Zap,
  Lock,
  PackageCheck,
  Store,
  ShoppingBag,
  Star,
  ChevronRight,
  TrendingUp,
  Headphones,
  RefreshCw,
} from 'lucide-react';

export const About = () => {
  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 min-h-screen py-10 sm:py-16 transition-colors duration-200">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* =========================================================================
            1. BREADCRUMBS & HERO INTRO SECTION
           ========================================================================= */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400 font-medium">
            <Link to="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-slate-600" />
            <span className="text-zinc-800 dark:text-slate-200 font-semibold">About Us</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>The Shoply Story & Standard</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight">
              Redefining Commerce for the{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                Modern World
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Founded on the belief that everyday shopping should be seamless, transparent, and inspiring.
              Shoply bridges the gap between discerning customers and verified sellers, offering curated quality,
              uncompromising security, and lightning fulfillment across India.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. KEY METRICS STATS BAR
           ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 text-center shadow-xs hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">500K+</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Happy Shoppers
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 text-center shadow-xs hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">10,000+</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Curated Products
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 text-center shadow-xs hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">99.8%</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              On-Time Delivery
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 text-center shadow-xs hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">4.9 / 5</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              Customer Rating
            </p>
          </div>
        </div>

        {/* =========================================================================
            3. VISUAL SHOWCASE COLLAGE
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-zinc-200 dark:border-slate-800 relative min-h-[320px] sm:min-h-[420px] bg-zinc-100 dark:bg-slate-900 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
              alt="Shoply Flagship Store and Logistics"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 right-6 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm mb-2">
                <Store className="w-3 h-3" /> Certified Marketplace
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                Where Quality Meets Transparent Commerce
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2">
                From precision smart gadgets and mechanical horology to runway fashion and artisanal home decor, every product is verified before dispatch.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex-1 rounded-3xl overflow-hidden border border-zinc-200 dark:border-slate-800 relative bg-zinc-100 dark:bg-slate-900 shadow-md group min-h-[190px]">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                alt="Automated fulfillment center"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fast Logistics</p>
                <p className="text-base sm:text-lg font-black text-white">Next-Day Nationwide Dispatch</p>
              </div>
            </div>

            <div className="flex-1 rounded-3xl overflow-hidden border border-zinc-200 dark:border-slate-800 relative bg-zinc-100 dark:bg-slate-900 shadow-md group min-h-[190px]">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
                alt="Artisan craftsmanship"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Artisan Network</p>
                <p className="text-base sm:text-lg font-black text-white">Empowering Verified Sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. MISSION & VISION (DUAL PERSPECTIVE)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-4 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Our Mission
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
              Democratizing Exceptional Commerce
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
              We empower modern consumers to discover, compare, and shop certified authentic goods with absolute certainty.
              By combining verified merchants, transparent seller comparisons, and fast fulfillment, we eliminate counter-feiting
              and hidden markups from the online shopping experience.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Strict multi-point merchant certification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Transparent price comparison across verified sellers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tamper-proof insured express logistics</span>
              </li>
            </ul>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-4 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Our Vision
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
              The Most Trusted Marketplace Platform
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
              To be the benchmark for trustworthy digital retail — a vibrant sanctuary where independent artisans,
              established national brands, and conscious shoppers collaborate with mutual equity, ethical fulfillment, and
              cutting-edge technology.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Direct creator equity and competitive commission models</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero-friction customer returns and instant automated refunds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sustainable, optimized packaging and carbon-neutral routing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================================
            5. CORE PILLARS OF EXCELLENCE
           ========================================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Why Choose Us
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white">
              The 4 Cornerstones of Shoply
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">
              Everything we build is engineered around reliability, customer protection, and premium discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-3.5 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Guaranteed Authenticity</h3>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
                Every merchant undergoes strict credential audits, serial validation, and random physical quality checks before selling.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-3.5 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Bank-Grade Security</h3>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
                Protected by 256-bit encryption, RBI-compliant payment processing, and comprehensive buyer escrow protection on every order.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-3.5 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Insured Swift Delivery</h3>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
                High-speed fulfillment partnerships with real-time GPS tracking and 100% loss/damage insurance on every parcel.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-3.5 shadow-xs hover:border-rose-500/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">24/7 Priority Support</h3>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed font-normal">
                Dedicated concierge support via live chat, instant ticketing, and hassle-free returns with zero automated loops.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. TIMELINE / OUR EVOLUTION
           ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#131d2e] border border-zinc-200/80 dark:border-slate-800 space-y-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
              The Evolution of Shoply
            </h2>
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              How we grew from an ambitious idea into a trusted multi-vendor ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
            <div className="space-y-3 border-l-2 md:border-l-0 md:border-t-2 border-amber-500 pl-4 md:pl-0 md:pt-4">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">2023 · PHASE 1</span>
              <h4 className="text-sm font-black text-zinc-950 dark:text-white">The Foundation</h4>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                Launched with 50 handcrafted creators, establishing our baseline standard for authenticated inventory and zero counterfeit tolerance.
              </p>
            </div>

            <div className="space-y-3 border-l-2 md:border-l-0 md:border-t-2 border-amber-500 pl-4 md:pl-0 md:pt-4">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">2024 · PHASE 2</span>
              <h4 className="text-sm font-black text-zinc-950 dark:text-white">Multi-Seller Platform</h4>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                Introduced the Multi-Seller Comparison engine, allowing shoppers to choose verified merchants by price, rating, and speed.
              </p>
            </div>

            <div className="space-y-3 border-l-2 md:border-l-0 md:border-t-2 border-amber-500 pl-4 md:pl-0 md:pt-4">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">2025 · PHASE 3</span>
              <h4 className="text-sm font-black text-zinc-950 dark:text-white">Nationwide Scale</h4>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                Crossed 250,000 satisfied shoppers, integrated live real-time inventory synchronizations, and rolled out zero-fee seller payouts.
              </p>
            </div>

            <div className="space-y-3 border-l-2 md:border-l-0 md:border-t-2 border-amber-500 pl-4 md:pl-0 md:pt-4">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">2026 · THE FUTURE</span>
              <h4 className="text-sm font-black text-zinc-950 dark:text-white">Intelligent Marketplace</h4>
              <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                Expanding curated collections, intelligent personalized discovery, instant lightning checkout, and luxury horology archives.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. TRUST GUARANTEES BADGES
           ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
            <PackageCheck className="w-7 h-7 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-950 dark:text-white">100% Genuine</p>
              <p className="text-[10px] text-zinc-500 dark:text-slate-400">Direct from Maker</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
            <RefreshCw className="w-7 h-7 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-950 dark:text-white">Easy 7-Day Returns</p>
              <p className="text-[10px] text-zinc-500 dark:text-slate-400">No Questions Asked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
            <Lock className="w-7 h-7 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-950 dark:text-white">256-Bit SSL</p>
              <p className="text-[10px] text-zinc-500 dark:text-slate-400">Encrypted Security</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200/80 dark:border-slate-800">
            <HeartHandshake className="w-7 h-7 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-950 dark:text-white">Buyer Protection</p>
              <p className="text-[10px] text-zinc-500 dark:text-slate-400">Escrow Guarantee</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            8. CALL TO ACTION (CTA)
           ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-r from-slate-950 via-slate-900 to-[#131d2e] text-white border border-slate-800 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -top-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Start Exploring Today
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Experience the Shoply Difference?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Whether you are hunting for rare horology collectibles, trending tech accessories, or bespoke apparel, our verified vault is open for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/seller/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Become a Certified Seller</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
