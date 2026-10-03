import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Sparkles, HeartHandshake, ArrowRight } from 'lucide-react';

export const About = () => {
  return (
    <div className="bg-white text-zinc-900 min-h-screen py-16">
      <div className="px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600">
            Heritage & Provenance
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
            Crafting the Standard for Modern Collectibles
          </h1>
          <p className="text-base text-zinc-600 leading-relaxed">
            Founded with an uncompromising belief that true luxury resides in human devotion, precision tolerances, and transparent provenance. Shoply is the global sanctuary for independent creators and discerning collectors.
          </p>
        </div>

        {/* Hero Image Showcase */}
        <div className="rounded-3xl overflow-hidden border border-zinc-200 relative aspect-[21/9] bg-zinc-100 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
            alt="Atelier workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 sm:left-10 max-w-lg">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              The Atelier Studio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Where Seconds Turn Into Heirlooms
            </h2>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Master Horology</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every mechanical component is calibrated under rigorous Swiss timing test benches to ensure chronometer precision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Acoustic Mastery</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              From vacuum tube DAC stages to custom beryllium drivers, our acoustics evoke emotional transcendence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Vetted Authenticity</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              All marketplace merchants undergo strict credential review, serial validation, and factory audit checks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Direct Creator Equity</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Our marketplace structure guarantees independent artisans receive industry-leading revenue splits on every sale.
            </p>
          </div>
        </div>

        {/* Numbers Impact */}
        <div className="border-t border-b border-zinc-200 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-zinc-50 rounded-3xl">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-amber-600">₹150 Cr+</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              Artisan Revenue Generated
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-zinc-900">124</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              Countries Shipped
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-zinc-900">99.4%</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              Five-Star Appraisals
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-rose-600">100%</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              Insured Shipments
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <h2 className="text-2xl font-black text-zinc-950 mb-3">Begin Your Curated Collection</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
            Explore our vault of horology, audio, and architectural tech icons.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 px-8 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};
