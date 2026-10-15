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

// Official Brand Social Media Icons (Authentic Colors & Exact Vector Geometry)
const FacebookIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#1877F2" />
    <path
      d="M26.8 20.8H22.4V36H16.2V20.8H13.2V15.5H16.2V11.9C16.2 8.9 18 6.5 22.8 6.5C24.8 6.5 26.2 6.7 26.2 6.7V11.6H24C22.5 11.6 22.4 12.4 22.4 13.6V15.5H27.1L26.8 20.8Z"
      fill="white"
    />
  </svg>
);

const InstagramIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ig-rg" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="40" height="40" rx="20" fill="url(#ig-rg)" />
    <rect x="10.5" y="10.5" width="19" height="19" rx="5.5" stroke="white" strokeWidth="2.2" fill="none" />
    <circle cx="20" cy="20" r="4.6" stroke="white" strokeWidth="2.2" fill="none" />
    <circle cx="24.8" cy="15.2" r="1.3" fill="white" />
  </svg>
);

const TwitterIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#000000" />
    <path
      d="M25.4 12H28.4L21.8 19.5L29.6 29.5H23.5L18.7 23.2L13.2 29.5H10.2L17.2 21.5L9.8 12H16.1L20.4 17.7L25.4 12ZM24.3 27.7H26L15.3 13.7H13.5L24.3 27.7Z"
      fill="white"
    />
  </svg>
);


const LinkedinIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#0A66C2" />
    <path
      d="M13.8 16.5H17.2V27.5H13.8V16.5ZM15.5 11.2C16.6 11.2 17.5 12.1 17.5 13.2C17.5 14.3 16.6 15.2 15.5 15.2C14.4 15.2 13.5 14.3 13.5 13.2C13.5 12.1 14.4 11.2 15.5 11.2ZM18.7 16.5H21.9V18.1H22C22.5 17.2 23.6 16.2 25.3 16.2C28.8 16.2 29.5 18.5 29.5 21.5V27.5H26V22C26 20.7 25.9 19 24.1 19C22.3 19 22 20.4 22 21.9V27.5H18.7V16.5Z"
      fill="white"
    />
  </svg>
);

const WhatsappIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 9C13.925 9 9 13.925 9 20C9 22.062 9.57 23.987 10.562 25.632L9.2 30.6L14.332 29.268C15.932 30.207 17.9 30.75 20 30.75C26.075 30.75 31 25.825 31 20C31 13.925 26.075 9 20 9ZM20 10.875C25.04 10.875 29.125 14.96 29.125 20C29.125 25.04 25.04 29.125 20 29.125C18.258 29.125 16.623 28.636 15.228 27.79L14.9 27.592L11.378 28.513L12.316 25.074L12.098 24.726C11.196 23.284 10.875 21.68 10.875 20C10.875 14.96 14.96 10.875 20 10.875ZM16.35 14.832C16.14 14.832 15.825 14.912 15.545 15.215C15.265 15.517 14.5 16.237 14.5 17.7C14.5 19.162 15.57 20.575 15.715 20.772C15.86 20.97 17.815 23.982 20.81 25.275C21.522 25.582 22.08 25.768 22.512 25.905C23.228 26.132 23.882 26.1 24.4 26.022C24.978 25.935 26.175 25.295 26.425 24.595C26.675 23.895 26.675 23.3 26.6 23.175C26.525 23.05 26.315 22.98 26 22.825C25.685 22.67 24.17 21.925 23.89 21.825C23.61 21.725 23.41 21.675 23.2 21.975C22.99 22.275 22.41 22.975 22.23 23.175C22.05 23.375 21.87 23.4 21.56 23.245C21.25 23.09 20.25 22.762 19.06 21.7C18.13 20.87 17.5 19.845 17.32 19.535C17.14 19.225 17.3 19.057 17.45 18.91C17.58 18.78 17.74 18.57 17.89 18.395C18.04 18.22 18.09 18.095 18.19 17.89C18.29 17.685 18.24 17.51 18.165 17.355C18.09 17.2 17.47 15.67 17.21 15.07C16.96 14.485 16.705 14.565 16.515 14.555L16.35 14.832Z"
      fill="white"
    />
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
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Shoply on Facebook"
                    title="Facebook"
                    className="group inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <FacebookIcon className="w-9.5 h-9.5 sm:w-10 sm:h-10" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Shoply on Instagram"
                    title="Instagram"
                    className="group inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm shadow-pink-500/20 hover:shadow-md hover:shadow-pink-500/35 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <InstagramIcon className="w-9.5 h-9.5 sm:w-10 sm:h-10" />
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Shoply on X (Twitter)"
                    title="X (Twitter)"
                    className="group inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/35 ring-1 ring-slate-200 dark:ring-slate-700/80 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                  >
                    <TwitterIcon className="w-9.5 h-9.5 sm:w-10 sm:h-10" />
                  </a>


                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Shoply on LinkedIn"
                    title="LinkedIn"
                    className="group inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/35 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                  >
                    <LinkedinIcon className="w-9.5 h-9.5 sm:w-10 sm:h-10" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Shoply on WhatsApp"
                    title="WhatsApp"
                    className="group inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 active:scale-95 shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <WhatsappIcon className="w-9.5 h-9.5 sm:w-10 sm:h-10" />
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
