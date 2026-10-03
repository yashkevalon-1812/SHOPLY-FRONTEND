import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Flame,
  Sparkles,
  Clock,
  ArrowRight,
  Copy,
  X,
  Zap,
} from 'lucide-react';

export const MegaSaleBanner = () => {
  const { addToast } = useToast();
  const [promo, setPromo] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('shoply_mega_sale_dismissed') === 'true';
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const { data } = await api.get('/promotions/active');
        if (data && data.isActive) {
          setPromo(data);
        } else {
          setPromo(null);
        }
      } catch (err) {
        setPromo(null);
      }
    };

    fetchPromo();
  }, []);

  useEffect(() => {
    if (!promo || !promo.endDate) return;

    const calculateTime = () => {
      const difference = new Date(promo.endDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [promo]);

  if (!promo || !promo.isActive || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('shoply_mega_sale_dismissed', 'true');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
  };

  const getGradient = (theme) => {
    switch (theme) {
      case 'royal':
        return 'from-blue-700 via-indigo-800 to-slate-950 text-white';
      case 'crimson':
        return 'from-rose-600 via-red-700 to-amber-900 text-white';
      case 'neon':
        return 'from-emerald-600 via-teal-800 to-slate-950 text-white';
      case 'amber':
      default:
        return 'from-amber-500 via-orange-600 to-rose-700 text-white';
    }
  };

  return (
    <div
      className={`relative overflow-hidden shadow-lg border-b border-white/20 transition-all duration-300 bg-gradient-to-r ${getGradient(
        promo.theme
      )}`}
    >
      {/* Background Decorative Blurs */}
      <div className="pointer-events-none absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -top-12 w-64 h-64 bg-black/15 rounded-full blur-3xl" />

      <div className="px-4 sm:px-6 lg:px-8 py-3.5 relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Headline & Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/25 shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            <span>{promo.badgeText || 'MEGA SALE EVENT'}</span>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-wide drop-shadow-xs flex items-center justify-center sm:justify-start gap-1.5">
              <span>{promo.title}</span>
              <span className="hidden lg:inline font-normal text-white/85">·</span>
              <span className="hidden lg:inline text-xs font-semibold text-white/90">
                {promo.subtitle}
              </span>
            </h3>
          </div>
        </div>

        {/* Right: Live Countdown Clock, Promo Code & CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Ticking Countdown Clock */}
          <div className="flex items-center gap-1 text-[11px] font-mono bg-black/35 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-300 mr-0.5" />
            <span className="font-black">{timeLeft.days}d</span>:
            <span className="font-black">{String(timeLeft.hours).padStart(2, '0')}h</span>:
            <span className="font-black">{String(timeLeft.minutes).padStart(2, '0')}m</span>:
            <span className="font-black text-amber-300">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>

          {/* Coupon Code Pill */}
          {promo.couponCode && (
            <button
              onClick={() => copyCode(promo.couponCode)}
              className="group flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-3 py-1 rounded-xl text-xs font-mono font-black transition-all active:scale-95 shadow-2xs"
              title="Click to copy coupon code"
            >
              <span>CODE:</span>
              <span className="text-amber-300 underline underline-offset-2">{promo.couponCode}</span>
              <Copy className="w-3 h-3 text-white/70 group-hover:text-white" />
            </button>
          )}

          {/* Shop Now CTA */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>Shop Sale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-black/20 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
