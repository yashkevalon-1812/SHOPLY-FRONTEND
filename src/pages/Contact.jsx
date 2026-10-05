import { useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export const Contact = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSentSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      addToast('Your inquiry has been sent to our concierge team', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does Shoply ensure every product is authentic?',
      a: 'Every piece listed on Shoply is subjected to strict quality checks and seller verification before fulfillment. Each order is guaranteed 100% genuine.',
    },
    {
      q: 'What is the merchant vetting and seller approval process?',
      a: 'Merchants submit business credentials, store details, and catalog offerings. Our administration reviews and activates merchant portals. Only verified merchants can publish products to the marketplace.',
    },
    {
      q: 'What are your international shipping times and duties?',
      a: 'We ship via insured DHL Express and FedEx Priority worldwide. Deliveries arrive quickly with full track-and-trace monitoring.',
    },
    {
      q: 'What is your returns and warranty coverage?',
      a: 'We offer a 30-day return window with prepaid shipping labels. Additionally, verified items include full Shoply warranty protection.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0b1120] text-zinc-900 dark:text-slate-100 min-h-screen py-16 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Customer Care & Support
          </span>
          <h1 className="text-4xl font-black text-zinc-950 dark:text-white">
            Connect With Shoply Support
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Have a question about a product, seller partnership, or existing order? Our team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details & Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Direct Support Channels</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-slate-400 font-medium block">Support Email</span>
                    <a href="mailto:support@shoply.com" className="font-bold text-zinc-900 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400">
                      support@shoply.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-slate-400 font-medium block">Toll-Free Client Desk</span>
                    <span className="font-bold text-zinc-900 dark:text-slate-200">+1 (800) 849-0192</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-slate-400 font-medium block">Atelier Flagship</span>
                    <span className="font-bold text-zinc-900 dark:text-slate-200">450 Madison Avenue, New York, NY 10022</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-slate-400 font-medium block">Advisory Hours</span>
                    <span className="font-bold text-zinc-900 dark:text-slate-200">24 Hours / 7 Days a Week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Note */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 text-xs text-zinc-600 dark:text-slate-300 space-y-2">
              <span className="text-amber-700 dark:text-amber-400 font-bold block">Merchant & Seller Applications</span>
              <p>
                Interested in listing your products on Shoply? Register as a seller and our merchant relations team will review your application.
              </p>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Send a Direct Inquiry
            </h2>
            <p className="text-xs text-zinc-500 dark:text-slate-400 mb-6">
              Messages are routed directly to our concierge team and logged in our executive portal.
            </p>

            {sentSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Thank you! Your inquiry has been confirmed. An advisor will respond within 2 hours.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Julian Vance"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. julian@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Inquiry regarding order, product, or partnership"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-700 dark:text-slate-300 font-bold block mb-1">Message</label>
                <textarea
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your question or requirements in detail..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-400 dark:text-slate-950" />
                <span>{submitting ? 'Transmitting Message...' : 'Transmit Inquiry'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto pt-10 border-t border-zinc-200 dark:border-slate-800">
          <h2 className="text-2xl font-black text-zinc-950 dark:text-white text-center mb-8">
            Frequently Addressed Topics
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-zinc-900 dark:text-white flex items-center justify-between gap-4 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-slate-300 leading-relaxed border-t border-zinc-200/80 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
