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
      {/* Value Badges Banner */}
      <div className="border-b border-zinc-200 dark:border-slate-800 py-6 sm:py-7 bg-white dark:bg-[#0b1120] transition-colors">
        <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
              <Truck className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white leading-snug">Insured Global Delivery</h4>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">Complimentary over ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white leading-snug">Authenticity Guaranteed</h4>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">Certified by expert curators</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white leading-snug">30-Day Hassle-Free Returns</h4>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">Prepaid return labels</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <Headphones className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white leading-snug">24/7 Dedicated Concierge</h4>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400">Real human client advisors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand Bio with Prominent Shoply Logo */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link to="/" className="inline-block group" aria-label="Shoply Home">
              <ShoplyLogo size="lg" />
            </Link>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-slate-300 leading-relaxed max-w-sm font-normal">
              Shoply represents the nexus of modern lifestyle, curated essentials, and high-performance technology. We unite verified merchants with discerning customers worldwide.
            </p>
            <div className="pt-1 flex items-center gap-3 text-xs sm:text-sm text-zinc-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Systems Operational
              </span>
              <span>·</span>
              <span>PCI-DSS Level 1 Secure</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-3">
              Collections
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-slate-300 font-medium">
              <li>
                <Link to="/shop?category=Luxury%20Watches" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Luxury Watches
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Audio" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Acoustic & Audio
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Electronics" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Next-Gen Tech
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Apparel & Leather
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Footwear" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Designer Footwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Home%20%26%20Living" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Home & Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-3">
              Client Care
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-slate-300 font-medium">
              <li>
                <Link to="/orders" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Concierge Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Our Provenance
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Seller Sign In
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  FAQs & Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* VIP Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-white mb-2">
              The Shoply Club
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 mb-3.5 leading-relaxed">
              Subscribe for private drops, secret flash sales, and editorials.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Unlock VIP Privileges</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-5 sm:mt-10 sm:pt-6 border-t border-zinc-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-zinc-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Shoply Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 font-medium">
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
