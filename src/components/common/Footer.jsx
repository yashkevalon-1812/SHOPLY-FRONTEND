import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Check } from 'lucide-react';
import { ShoplyLogo } from './ShoplyLogo';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-zinc-50 dark:bg-[#070b14] text-zinc-600 dark:text-slate-400 border-t border-zinc-200 dark:border-slate-800 transition-colors duration-200">
      {/* =========================================================================
          1. VALUE BADGES BANNER (Responsive 2x2 on Mobile, 4-col on Desktop)
         ========================================================================= */}
      <div className="border-b border-zinc-200 dark:border-slate-800 py-4 sm:py-6 bg-white dark:bg-[#0b1120] transition-colors">
        <div className="max-w-[1490px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {/* Delivery */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/60 dark:border-slate-800/60 lg:bg-transparent lg:border-none lg:p-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-tight truncate">
                  Insured Delivery
                </h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-slate-400 truncate">
                  Complimentary over ₹1,999
                </p>
              </div>
            </div>

            {/* Authenticity */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/60 dark:border-slate-800/60 lg:bg-transparent lg:border-none lg:p-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-tight truncate">
                  100% Authentic
                </h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-slate-400 truncate">
                  Certified by expert curators
                </p>
              </div>
            </div>

            {/* Returns */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/60 dark:border-slate-800/60 lg:bg-transparent lg:border-none lg:p-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-tight truncate">
                  30-Day Returns
                </h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-slate-400 truncate">
                  Hassle-free prepaid labels
                </p>
              </div>
            </div>

            {/* Concierge */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-slate-900/40 border border-zinc-200/60 dark:border-slate-800/60 lg:bg-transparent lg:border-none lg:p-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-tight truncate">
                  24/7 Concierge
                </h4>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-slate-400 truncate">
                  Dedicated client advisors
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN FOOTER CONTENT & LINKS (Clean, 2-Col on Mobile)
         ========================================================================= */}
      <div className="max-w-[1490px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Bio Column */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <Link to="/" className="inline-block group" aria-label="Shoply Home">
              <ShoplyLogo size="lg" />
            </Link>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-slate-300 leading-relaxed max-w-sm font-normal">
              Shoply represents the nexus of modern lifestyle, curated essentials, and high-performance technology. We unite verified merchants with discerning customers worldwide.
            </p>
            <div className="pt-0.5 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Systems Operational
              </span>
              <span>·</span>
              <span>PCI-DSS Level 1 Secure</span>
            </div>
          </div>

          {/* Links Section: On mobile, side-by-side 2-column grid so it doesn't take 12 vertical lines */}
          <div className="md:contents col-span-1">
            <div className="grid grid-cols-2 md:contents gap-6 sm:gap-8">
              {/* Catalog Collections */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-2.5 sm:mb-3">
                  Collections
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-slate-300 font-medium">
                  <li>
                    <Link to="/shop?category=Luxury%20Watches" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Luxury Watches
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Audio" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Acoustic & Audio
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Electronics" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Next-Gen Tech
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Fashion" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Apparel & Leather
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Footwear" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Designer Footwear
                    </Link>
                  </li>
                  <li>
                    <Link to="/shop?category=Home%20%26%20Living" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Home & Living
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Client Care */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-2.5 sm:mb-3">
                  Client Care
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-slate-300 font-medium">
                  <li>
                    <Link to="/orders" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Track Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Support Center
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Our Provenance
                    </Link>
                  </li>
                  <li>
                    <Link to="/seller/register" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Become a Seller
                    </Link>
                  </li>
                  <li>
                    <Link to="/seller/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      Seller Studio
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block py-0.5">
                      FAQs & Warranty
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* VIP Newsletter Form */}
          <div className="md:col-span-2 lg:col-span-1 space-y-2.5 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              The Shoply Club
            </h3>
            <p className="text-xs text-zinc-500 dark:text-slate-400 leading-relaxed">
              Subscribe for private vault drops, secret flash discounts, and weekly luxury editorials.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-white dark:bg-[#0f172a] border border-zinc-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors shadow-2xs"
              />
              <button
                type="submit"
                className="w-full bg-zinc-950 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Unlock VIP Privileges</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* =========================================================================
            3. BOTTOM COPYRIGHT & LEGAL BAR (Clean Wrapping on Mobile)
           ========================================================================= */}
        <div className="mt-8 pt-5 sm:mt-10 sm:pt-6 border-t border-zinc-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] sm:text-xs text-zinc-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Shoply Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1.5 font-medium">
            <Link to="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Security Audits
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
