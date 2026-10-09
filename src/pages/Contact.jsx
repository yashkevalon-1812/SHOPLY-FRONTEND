import { useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// Social Media Icons
const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSentSuccess(true);
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
      });
      addToast('Your message has been sent successfully. We will contact you soon.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-screen transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950">
      {/* =========================================================================
          1. HERO HEADER SECTION (Shoply Signature Palette + Office Backdrop)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0b1329] pt-20 pb-32 sm:pt-28 sm:pb-44 text-center">
        {/* Background photo of professional office workspace */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=80"
            alt="Office workspace"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Shoply Deep Navy/Slate gradient overlay matching website brand identity */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1329]/95 via-[#0f1b3d]/90 to-[#0b1120]/98 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Customer Care & Concierge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
            Contact us
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed max-w-xl mx-auto">
            Shoply is ready to provide the right solution according to your needs
          </p>
        </div>
      </section>

      {/* =========================================================================
          2. FLOATING CONTACT CARD (Get in touch + Send us a message)
         ========================================================================= */}
      <main className="relative z-20 -mt-20 sm:-mt-28 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-950/10 dark:shadow-black/60 border border-slate-100 dark:border-slate-800/80 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ---------------------------------------------------------------------
                LEFT COLUMN: Get in touch
               --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 p-7 sm:p-10 lg:p-12 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mb-3">
                  Get in touch
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-slate-400 leading-relaxed mb-8 sm:mb-10">
                  Have questions about our products, orders, or custom concierge? Reach out to our dedicated client care team anytime.
                </p>

                {/* Contact List */}
                <div className="space-y-6 sm:space-y-7">
                  {/* Head Office */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                      <MapPin className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">
                        Head Office
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                        Shoply Atelier, 450 Madison Avenue<br />
                        New York, NY 10022 - United States
                      </p>
                    </div>
                  </div>

                  {/* Email Us */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                      <Mail className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">
                        Email Us
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                        <a
                          href="mailto:support@shoply.com"
                          className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                        >
                          support@shoply.com
                        </a>
                        <a
                          href="mailto:hello@shoply.com"
                          className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors block"
                        >
                          hello@shoply.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Call Us */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                      <Phone className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-1">
                        Call Us
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-slate-300 leading-relaxed">
                        <span>Phone : +91 800-849-0192</span><br />
                        <span>Fax : +91 800-849-0193</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow our social media */}
              <div className="mt-8 sm:mt-12 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white mb-3.5">
                  Follow our social media
                </h3>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 shadow-sm shadow-slate-900/20"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 shadow-sm shadow-slate-900/20"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 shadow-sm shadow-slate-900/20"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 flex items-center justify-center transition-all hover:scale-105 shadow-sm shadow-slate-900/20"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------------
                RIGHT COLUMN: Send us a message
               --------------------------------------------------------------------- */}
            <div className="lg:col-span-7 p-7 sm:p-10 lg:p-12">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mb-6">
                Send us a message
              </h2>

              {sentSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Thank you! Your inquiry has been sent successfully. Our concierge will get back to you shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Row 1: Name & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Name"
                      className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company"
                      className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                      className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Subject */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Subject"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>

                {/* Row 4: Message */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-slate-300 block mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Message"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Send Button (Shoply Signature Amber Gold Theme) */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
