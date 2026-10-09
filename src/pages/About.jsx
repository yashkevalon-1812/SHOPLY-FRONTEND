import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Zap,
  Clock,
  ChevronDown,
  TrendingUp,
  Truck,
  RotateCcw,
  Headphones,
  Users,
  CheckCircle2,
  PackageCheck,
  Store,
  ShoppingBag,
  Star,
  Mail,
  MapPin,
  Copy,
  Check,
  Heart,
  Shield,
  Layers,
  HeartHandshake,
} from 'lucide-react';

// Smooth Animated Count-Up Component
const AnimatedCounter = ({ target, duration = 1800, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;
      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, target, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString('en-IN');

  return (
    <span ref={ref} className="tabular-nums inline-block">
      {prefix}{formatted}{suffix}
    </span>
  );
};

export const About = () => {
  // Department filter state for employees showcase
  const [selectedDept, setSelectedDept] = useState('all');

  // Copied email state for interactive employee contact
  const [copiedEmail, setCopiedEmail] = useState(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Copy email handler
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Scroll to team section smoothly
  const scrollToTeam = () => {
    const el = document.getElementById('team');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 8 Dedicated Employees and Team Members
  const employees = [
    {
      id: 1,
      name: 'Aarav Mehta',
      role: 'Founder & Chief Executive Officer',
      department: 'leadership',
      deptLabel: 'Leadership',
      location: 'Bengaluru HQ',
      email: 'aarav@shoply.in',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bio: 'Founded Shoply to build a transparent, customer-first alternative to bloated marketplaces. Passionate about empowering local Indian artisans and brands.',
      focus: 'Company Vision & Strategy',
    },
    {
      id: 2,
      name: 'Ananya Sharma',
      role: 'Chief Technology Officer',
      department: 'tech',
      deptLabel: 'Engineering & Tech',
      location: 'Bengaluru HQ',
      email: 'ananya@shoply.in',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      bio: 'Leads our engineering team, building the multi-seller transparent pricing engine, ultra-fast search, and real-time inventory synchronization.',
      focus: 'Platform Architecture & AI',
    },
    {
      id: 3,
      name: 'Vikramaditya Roy',
      role: 'VP of Logistics & Supply Chain',
      department: 'operations',
      deptLabel: 'Operations & Logistics',
      location: 'Delhi NCR Hub',
      email: 'vikram@shoply.in',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      bio: 'Manages our nationwide fulfillment network, ensuring packages are securely packed in biodegradable honeycomb boxes and delivered on time.',
      focus: 'Express Courier & Transit',
    },
    {
      id: 4,
      name: 'Sneha Mukherjee',
      role: 'Head of Customer Experience',
      department: 'support',
      deptLabel: 'Customer Experience',
      location: 'Mumbai Office',
      email: 'sneha@shoply.in',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      bio: 'Champions our 24/7 human-first support promise. Sneha ensures every shopper inquiry receives genuine, caring resolution within minutes.',
      focus: '24/7 Support & Care',
    },
    {
      id: 5,
      name: 'Rohan Kapoor',
      role: 'Head of Product Design (UX/UI)',
      department: 'tech',
      deptLabel: 'Engineering & Tech',
      location: 'Bengaluru HQ',
      email: 'rohan@shoply.in',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      bio: 'Crafts the intuitive, distraction-free shopping journey across mobile and web. Believes that modern e-commerce should feel effortless and delightful.',
      focus: 'Interface & User Journey',
    },
    {
      id: 6,
      name: 'Dr. Priya Nambiar',
      role: 'Head of Quality & Brand Authenticity',
      department: 'operations',
      deptLabel: 'Operations & Logistics',
      location: 'Bengaluru Hub',
      email: 'priya@shoply.in',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
      bio: 'Oversees our multi-point authentication protocol, verifying brand licenses, trademark authorizations, and batch certifications before listing.',
      focus: 'Zero-Counterfeit Standards',
    },
    {
      id: 7,
      name: 'Arjun Patel',
      role: 'Director of Merchant Partnerships',
      department: 'leadership',
      deptLabel: 'Leadership',
      location: 'Jaipur & Ahmedabad',
      email: 'arjun@shoply.in',
      emailTitle: 'arjun@shoply.in',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      bio: 'Works directly with independent Indian designers, craftsmen, and manufacturers to bring their unique collections to conscious shoppers nationwide.',
      focus: 'Artisan & Merchant Growth',
    },
    {
      id: 8,
      name: 'Neha Joshi',
      role: 'Lead Fashion & Lifestyle Curator',
      department: 'support',
      deptLabel: 'Customer Experience',
      location: 'Mumbai Office',
      email: 'neha@shoply.in',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      bio: 'Hand-picks seasonal drops across apparel, accessories, and home living, ensuring every product meets our strict design and quality standards.',
      focus: 'Catalog Quality & Trends',
    },
  ];

  const filteredEmployees =
    selectedDept === 'all'
      ? employees
      : employees.filter((e) => e.department === selectedDept);

  // 4 Core Values
  const coreValues = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Quality',
      description:
        'We have zero tolerance for counterfeits. Every brand, artisan, and seller submits official invoices and GST verification before listing a single product.',
      tag: 'Zero Counterfeits',
    },
    {
      icon: TrendingUp,
      title: 'Multi-Seller Price Transparency',
      description:
        'We never hide cheaper sellers behind secretive algorithms. We show all verified sellers side-by-side so you always get the best price and fastest delivery.',
      tag: 'Honest Deals',
    },
    {
      icon: PackageCheck,
      title: 'Eco-Armor Packaging',
      description:
        'Your orders are protected in impact-absorbing double-walled honeycomb containers that are 100% recyclable, eliminating unnecessary plastic waste.',
      tag: 'Sustainable Transit',
    },
    {
      icon: Headphones,
      title: 'Customer-Obsessed Human Care',
      description:
        'No endless automated phone loops or unhelpful bots. Our 24/7 dedicated support team answers quickly and solves questions with genuine warmth.',
      tag: '24/7 Human Help',
    },
  ];

  // Shoply vs Traditional Marketplaces
  const comparisons = [
    {
      feature: 'Product Authenticity',
      traditional: 'Open marketplaces flooded with unvetted drop-shippers and counterfeit risk.',
      shoply: '100% verified genuine products sourced directly from authorized brands and makers.',
    },
    {
      feature: 'Seller Pricing',
      traditional: 'Single opaque buy-box that conceals cheaper sellers from the buyer.',
      shoply: 'Transparent multi-seller comparison showing exact prices, delivery speeds, and ratings.',
    },
    {
      feature: 'Protective Packaging',
      traditional: 'Flimsy plastic polybags with minimal shock protection; high transit damage.',
      shoply: 'Shock-proof double-walled honeycomb boxes that are 100% biodegradable and insured.',
    },
    {
      feature: 'Returns & Refunds',
      traditional: 'Frustrating multi-week claim processes requiring manual escalations.',
      shoply: 'Hassle-free 7-day returns with instant refund initiation upon courier pickup.',
    },
    {
      feature: 'Customer Service',
      traditional: 'Scripted automated chatbots that loop customers in repetitive circles.',
      shoply: 'Real, caring human support specialists available 24/7 via call, chat, and email.',
    },
  ];

  // Real Customer Testimonials
  const testimonials = [
    {
      name: 'Aditya Kashyap',
      location: 'Bengaluru, Karnataka',
      role: 'Verified Buyer',
      quote:
        'I ordered high-end wireless headphones and was amazed by the experience. The packaging was pristine, delivery arrived the next afternoon, and I saved ₹1,800 by comparing sellers. Shoply has earned my trust.',
      item: 'Beryllium ANC Headphones',
      rating: 5,
    },
    {
      name: 'Meera Deshmukh',
      location: 'Pune, Maharashtra',
      role: 'Boutique Apparel Partner',
      quote:
        'As an independent designer, other giant marketplaces squeezed my profits with hidden ad charges. Shoply offers fair payouts, zero hidden fees, and introduced my handloom collections to thousands of genuine buyers.',
      item: 'Verified Merchant Partner',
      rating: 5,
    },
    {
      name: 'Kabir Varma',
      location: 'New Delhi',
      role: 'Verified Buyer',
      quote:
        'The transparent multi-seller comparison is a game-changer. I could pick the seller closest to Delhi for same-day dispatch. Customer support answered my sizing question in less than 2 minutes.',
      item: 'Classic Leather Weekend Bag',
      rating: 5,
    },
  ];

  // Frequently Asked Questions
  const faqs = [
    {
      q: 'How does Shoply ensure all products are 100% authentic?',
      a: 'We require all sellers to provide authorized brand authorization certificates, GST verification, and direct manufacturer invoices. Every item dispatched from our fulfillment centers undergoes physical inspection before packaging.',
    },
    {
      q: 'How does Multi-Seller Comparison benefit me?',
      a: 'When multiple verified merchants carry the same catalog item, we display them all side-by-side with their live prices, fulfillment hubs, and verified seller ratings so you can pick the best offer without overpaying.',
    },
    {
      q: 'What is your returns and refund policy?',
      a: 'We offer a hassle-free 7-day return window. If you are not completely satisfied with your purchase, you can request a pickup with zero hassle. Refunds are initiated immediately once the courier inspects the parcel.',
    },
    {
      q: 'How can independent brands and artisans sell on Shoply?',
      a: 'We welcome verified makers and authorized distributors! You can register via our Seller Portal in under 5 minutes. Once our onboarding team approves your business documents, you gain immediate access to our national audience and express logistics.',
    },
    {
      q: 'Are my payments secure on Shoply?',
      a: 'Yes, 100%. All transactions are processed through RBI-compliant, PCI-DSS certified payment gateways protected by 256-bit bank-grade encryption. Payment is held in secure escrow until your delivery is safely fulfilled.',
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 min-h-screen py-8 sm:py-14 transition-colors duration-200 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">

        {/* =========================================================================
            2. HERO SECTION (EDITORIAL, WARM & INSPIRING)
           ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Narrative & Mission */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Our Story & Mission</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-950 dark:text-white tracking-tight leading-snug">
              Making Everyday Shopping{' '}
              <br/>
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                Better, Faster, and Honest.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-700 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
              Founded in 2023, Shoply was created to fix what was broken about online marketplaces. 
              We believe shopping should be a joyful experience — with zero counterfeit risk, crystal-clear 
              multi-seller prices, eco-friendly secure packaging, and friendly human customer care whenever you need it.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs sm:text-sm font-black px-7 sm:px-8 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Shoply Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={scrollToTeam}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-stone-300 dark:border-slate-700 text-xs sm:text-sm font-bold px-6 sm:px-7 py-3.5 rounded-full transition-all shadow-2xs hover:border-amber-500 active:scale-95 cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-500" />
                <span>Meet Our Team</span>
              </button>

            </div>

            {/* Quick Trust Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-stone-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Genuine Certified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-Seller Transparent Price
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 7-Day Hassle-Free Returns
              </span>
            </div>
          </div>

          {/* Right Column: Visual Collage with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] border border-stone-200/80 dark:border-slate-800 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Shoply Team Collaboration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Bottom Image Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Built with Passion in Bengaluru
                </p>
                <p className="text-sm font-bold">The Team Behind Your Orders</p>
              </div>
            </div>

            {/* Floating Top-Left Badge */}
            <div className="absolute -top-4 -left-3 sm:-left-6 bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight"><AnimatedCounter target={500000} suffix="+" /></p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Happy Shoppers</p>
              </div>
            </div>

            {/* Floating Bottom-Right Badge */}
            <div className="absolute -bottom-4 -right-3 sm:-right-6 bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight">100% Genuine</p>
                <p className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">Direct Sourced</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. KEY NUMBERS & IMPACT BENTO
           ========================================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={500000} suffix="+" /></p>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-300 mt-1">Conscious Shoppers</h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">Across every state and union territory</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={50000} suffix="+" /></p>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-300 mt-1">Curated Products</h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">Electronics, fashion, home & lifestyle</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={10000} suffix="+" /></p>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-300 mt-1">Pincodes Delivered</h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">99.8% on-time transit precision</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={4.9} decimals={1} suffix=" / 5.0" /></p>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-300 mt-1">Customer Rating</h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">Over 120,000 verified buyer reviews</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. OUR STORY: HOW SHOPLY STARTED
           ========================================================================= */}
        <section className="p-6 sm:p-12 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                How It All Began
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                Built Out of Frustration. Rebuilt with Passion.
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed font-normal">
                <p>
                  In early 2023, our founders were frustrated by the state of online shopping in India. 
                  Marketplaces had become noisy, bloated, and impersonal. Consumers were constantly gambling with 
                  counterfeit products, opaque seller algorithms, and automated customer service loops that solved nothing.
                </p>
                <p>
                  We knew there was a better way: a platform where every seller is verified, every product is guaranteed 
                  original, and customers can transparently compare authorized stockists to get the best deal.
                </p>
                <p>
                  What started with a handful of independent boutique makers has grown into a bustling destination 
                  empowering over 500,000 households. Today, Shoply delivers curated fashion, electronics, and home 
                  essentials across 10,000+ pincodes with pride and integrity.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={250} prefix="₹" suffix=" Cr+" /></p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Paid to Local Creators
                  </p>
                </div>
                <div className="w-px h-10 bg-stone-200 dark:bg-slate-700" />
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white"><AnimatedCounter target={24} suffix=" Metros" /></p>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Next-Day Express Hubs
                  </p>
                </div>
              </div>
            </div>

            {/* Story Visuals */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] border border-stone-200 dark:border-slate-800 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
                  alt="Shoply Creative Workshop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[4/5] border border-stone-200 dark:border-slate-800 shadow-sm mt-6">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                  alt="Shoply Modern Hub"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. THE 4 CORE VALUES WE LIVE BY
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              The Shoply Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
              The Values That Guide Every Order
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
              We hold ourselves to higher standards so you can shop with complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => {
              const IconComponent = val.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {val.tag}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">
                        {val.title}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-normal">
                      {val.description}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span>Guaranteed on Every Order</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            6. MEET OUR TEAM / EMPLOYEES SHOWCASE (THE HIGHLIGHT)
           ========================================================================= */}
        <section id="team" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
              <Users className="w-3.5 h-3.5" /> The People Behind Shoply
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
              Meet Our Dedicated Employees
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400 leading-relaxed">
              Great shopping experiences don't happen by accident. Meet the founders, engineers, curators, 
              and support specialists working tirelessly behind the scenes to deliver your orders.
            </p>

            {/* Department Filter Tabs */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => setSelectedDept('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === 'all'
                    ? 'bg-[#171717] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:border-amber-500'
                }`}
              >
                All Team ({employees.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('leadership')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === 'leadership'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:border-amber-500'
                }`}
              >
                Leadership
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('tech')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === 'tech'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:border-blue-500'
                }`}
              >
                Engineering & Tech
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('operations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === 'operations'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:border-emerald-500'
                }`}
              >
                Operations & Logistics
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('support')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === 'support'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#131d2e] border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-slate-400 hover:border-rose-500'
                }`}
              >
                Customer Experience
              </button>
            </div>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="group flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
              >
                <div className="space-y-4">
                  {/* Photo Container */}
                  <div className="relative aspect-[4/4] rounded-2xl overflow-hidden bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                    <img
                      src={emp.image}
                      alt={emp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/65 backdrop-blur-md text-white border border-white/20">
                        {emp.deptLabel}
                      </span>
                    </div>
                  </div>

                  {/* Name and Designation */}
                  <div>
                    <h4 className="text-base font-black text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {emp.name}
                    </h4>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {emp.role}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-stone-400" /> {emp.location}
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-slate-300 leading-relaxed mt-2 line-clamp-3">
                      {emp.bio}
                    </p>
                  </div>
                </div>

                {/* Footer with Focus and Contact Email */}
                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-slate-800/80 space-y-2">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Focus: <span className="text-stone-700 dark:text-slate-300 font-medium lowercase">{emp.focus}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(emp.email)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {copiedEmail === emp.email ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Email Copied!</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span>{emp.email}</span>
                        </>
                      )}
                    </button>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Team Member"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hiring Callout Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-100/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                  Want to Build the Future of Commerce With Us?
                </h4>
                <p className="text-xs text-stone-600 dark:text-slate-400">
                  We are actively hiring passionate developers, designers, curators, and logistics experts in Bengaluru & Mumbai.
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
            7. SHOPLY VS TRADITIONAL MARKETPLACES (CLEAN COMPARISON TABLE)
           ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Clear Differentiation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
              Why Discerning Buyers Choose Shoply
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
              See the difference between mass marketplaces and Shoply's verified customer-first approach.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-[#131d2e] overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-stone-200/80 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/60 p-4 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-slate-400">
              <div className="md:col-span-4">Experience & Standard</div>
              <div className="md:col-span-4 hidden md:block text-stone-400">Traditional Marketplaces</div>
              <div className="md:col-span-4 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Shoply Standard</span>
              </div>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-slate-800/80">
              {comparisons.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 sm:gap-4 items-center">
                  <div className="md:col-span-4">
                    <p className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">
                      {row.feature}
                    </p>
                  </div>

                  <div className="md:col-span-4 text-xs text-stone-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✕
                    </span>
                    <span>{row.traditional}</span>
                  </div>

                  <div className="md:col-span-4 text-xs text-slate-900 dark:text-slate-100 font-medium flex items-start gap-2 bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="leading-relaxed">{row.shoply}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. BEHIND THE SCENES: PACKAGING & FULFILLMENT
           ========================================================================= */}
        <section className="p-6 sm:p-12 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Fulfillment Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
              How Your Order Reaches Your Doorstep
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
              Every parcel moves through a structured quality process before reaching your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-3">
              <span className="text-amber-600 dark:text-amber-400 font-mono text-xs font-black">STAGE 01</span>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Direct Maker Vetting</h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                Before entering our catalog, brand partner invoices and GST certificates are validated to ensure zero counterfeit risk.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-3">
              <span className="text-amber-600 dark:text-amber-400 font-mono text-xs font-black">STAGE 02</span>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Honeycomb Armor Packing</h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                Products are packed inside shock-absorbing, 100% biodegradable honeycomb containers to prevent any transit shock or damage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-3">
              <span className="text-amber-600 dark:text-amber-400 font-mono text-xs font-black">STAGE 03</span>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Insured Express Delivery</h3>
              <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed">
                Real-time tracking through our express logistics network with 100% loss/damage insurance and escrow payment protection.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. REAL CUSTOMER REVIEWS & SOCIAL PROOF
           ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Community Voices
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white">
              Loved by Discerning Shoppers & Creators
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
              Real feedback from certified customers and independent brand partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131d2e] border border-stone-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-slate-300 leading-relaxed font-medium italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-slate-800/80">
                  <p className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white">{t.name}</p>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">{t.role} · {t.location}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-1">
                    {t.item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            10. FREQUENTLY ASKED QUESTIONS
           ========================================================================= */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Clear & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-600 dark:text-slate-400">
              Everything you need to know about our standards, orders, and guarantees.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-[#131d2e] overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-amber-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-stone-600 dark:text-slate-300 leading-relaxed border-t border-stone-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            11. GRAND HIGH-CONVERTING CALL TO ACTION (CTA)
           ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-[#171717] dark:bg-[#0c1017] text-white border border-stone-800 shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" /> Start Shopping Today
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Experience the Shoply Way to Shop?
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              From fashion and electronics to home essentials — discover top quality products, 
              unbeatable deals, and honest customer care all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/seller/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Become a Verified Seller</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
