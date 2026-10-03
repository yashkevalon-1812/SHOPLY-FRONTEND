import { Link } from 'react-router-dom';
import {
  Check,
  Clock,
  Percent,
  ShieldCheck,
  Truck,
  Store,
  FileText,
  User,
  KeyRound,
  ClipboardCheck,
  BadgeCheck,
  ArrowRight,
  ChevronDown,
  Landmark,
} from 'lucide-react';
import { SellerApplicationForm } from '../components/seller/SellerApplicationForm';

const NEEDED = [
  { icon: User, label: 'Your full legal name', hint: 'Exactly as it appears on your ID' },
  { icon: FileText, label: 'An email address', hint: 'Used for sign-in and order updates' },
  { icon: KeyRound, label: 'A password', hint: 'Minimum 6 characters' },
  { icon: Store, label: 'Your shop or brand name', hint: 'Shown on every listing you publish' },
  { icon: ClipboardCheck, label: 'Your contact phone number', hint: 'So our team can reach you' },
  {
    icon: BadgeCheck,
    label: 'A short workshop description',
    hint: 'Your specialty, materials and process',
  },
  {
    icon: Landmark,
    label: 'A bank account for payouts',
    hint: 'Holder name, bank, account number and IFSC',
  },
];

const PERKS = [
  {
    icon: Percent,
    title: 'Zero listing fees',
    body: 'Publish unlimited products with no monthly subscription and no per-listing charge.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep control',
    body: 'Set your own pricing, manage your own listings and handle your own orders.',
  },
  {
    icon: Truck,
    title: 'Sell from anywhere',
    body: 'Shoply handles discovery, checkout and payments so you can focus on making.',
  },
];

// Mirrors Amazon's numbered-step guide: each entry lists what you provide at
// that stage and answers the questions sellers actually ask.
const STEPS = [
  {
    id: 'business',
    n: 1,
    title: 'Provide business information',
    icon: Store,
    intro:
      'This is the first information you provide. It tells us who you are and what you sell.',
    fields: [
      'Business type — individual, or a registered company',
      'Shop or brand name, as buyers will see it',
      'Workshop description and specialty',
      'Business address (registered sellers only)',
    ],
    faq: [
      {
        q: 'Do I need a registered company to sell on Shoply?',
        a: 'No. Choose "None, I am an individual" and we will collect fewer details. Plenty of our sellers are solo makers.',
      },
      {
        q: 'What if my shop name is already taken?',
        a: 'Submit the application anyway and our review team will suggest a nearby variation before approving you.',
      },
    ],
  },
  {
    id: 'seller',
    n: 2,
    title: 'Provide seller information',
    icon: User,
    intro:
      'This identifies you as the primary contact for your shop, and creates the login you will use to manage it.',
    fields: ['Full legal name', 'Contact phone number', 'Email address', 'Password'],
    faq: [
      {
        q: 'Why do you need my legal name?',
        a: 'Every application is reviewed by a person. Your legal name is how we confirm who the shop belongs to.',
      },
      {
        q: 'Can I use an email that already has a buyer account?',
        a: 'No. Each email can hold one role. Use a different address to sell, or sign in with your buyer account instead.',
      },
    ],
  },
  {
    id: 'payout',
    n: 3,
    title: 'Provide billing information',
    icon: Landmark,
    intro:
      'We use these details to pay you. They are encrypted before they are stored, and are never shown back to you in full.',
    fields: [
      'Account holder name, as it appears on your bank records',
      'Bank name and account type (savings or current)',
      'Account number',
      'IFSC code',
    ],
    faq: [
      {
        q: 'Who can hold the payout account?',
        a: 'The account must be in your name or your business name. We cannot pay a third party.',
      },
      {
        q: 'How do you protect my bank details?',
        a: 'Your account number and IFSC are encrypted with AES-256-GCM before they are saved, and are never returned by the API in readable form.',
      },
      {
        q: 'When will I be paid?',
        a: 'Payouts are released once your account is approved and each order is marked as delivered.',
      },
    ],
  },
  {
    id: 'review',
    n: 4,
    title: 'Review your application',
    icon: ClipboardCheck,
    intro:
      'Check everything before you submit. You can jump back to any step to edit. Bank details are shown masked.',
    fields: ['Confirm each field is accurate', 'Submit your application'],
    faq: [
      {
        q: 'Can I save and come back later?',
        a: 'Not yet. The form takes about three minutes, so it is usually easier to complete it in one go.',
      },
    ],
  },
  {
    id: 'verification',
    n: 5,
    title: 'Verification and approval',
    icon: BadgeCheck,
    intro:
      'After you submit, a member of our team reviews your workshop details before listing is enabled.',
    fields: ['Applications are usually reviewed within 1-2 business days'],
    faq: [
      {
        q: 'Why can I not add products straight away?',
        a: 'Every shop is approved by a person first. This keeps buyers on Shoply free from counterfeit and anonymous listings.',
      },
      {
        q: 'What if my application is rejected?',
        a: 'You will see the reason in your seller studio and can update your details and apply again.',
      },
    ],
  },
];

const FaqItem = ({ q, a }) => (
  <details className="group border-b border-zinc-200 last:border-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-xs font-bold text-zinc-900 transition-colors hover:text-amber-700">
      <span>{q}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
    </summary>
    <p className="pb-3.5 pr-8 text-xs leading-relaxed text-zinc-600">{a}</p>
  </details>
);

export const SellerRegister = () => {
  return (
    <div className="bg-zinc-50 text-zinc-900">
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a2f50] text-xl font-black text-white shadow-md">
              S
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-zinc-950">Shoply</span>
          </Link>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" />
            Applications reviewed in 1-2 business days
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Start selling on Shoply
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600">
            Reach buyers looking for handmade, small-batch and independent goods. No listing
            fees, no monthly charges, and you keep control of your shop.
          </p>

          <a
            href="#apply"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            Create your seller account
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Perks */}
        <div className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
            {PERKS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            {/* What you'll need */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-black text-zinc-950">
                Before you apply, have these ready
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                The whole form takes about two minutes.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {NEEDED.map(({ icon: Icon, label, hint }) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-zinc-500">{hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Steps guide */}
            <section>
              <h2 className="text-lg font-black text-zinc-950">5 steps to become a seller</h2>

              <nav className="mt-4 flex flex-wrap gap-2">
                {STEPS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-700 transition-colors hover:border-amber-400 hover:text-amber-700"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] text-white">
                      {s.n}
                    </span>
                    {s.title.replace('Provide ', '')}
                  </a>
                ))}
              </nav>

              <div className="mt-6 space-y-4">
                {STEPS.map((s) => (
                  <article
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-20 rounded-2xl border border-zinc-200 bg-white p-6"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1a2f50] text-sm font-black text-white">
                        {s.n}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="flex items-center gap-2 text-sm font-black text-zinc-950">
                          <s.icon className="h-4 w-4 text-amber-600" />
                          {s.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-600">{s.intro}</p>

                        <ul className="mt-3 space-y-1.5">
                          {s.fields.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs text-zinc-700">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 rounded-xl bg-zinc-50 px-4">
                          <p className="pt-3 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                            Frequently asked questions
                          </p>
                          {s.faq.map((item) => (
                            <FaqItem key={item.q} q={item.q} a={item.a} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-xs font-black text-zinc-950">Already selling on Shoply?</p>
              <p className="mt-1 text-xs text-zinc-600">
                Sign in to manage your listings, orders and payouts.
              </p>
              <Link
                to="/seller/login"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50"
              >
                Seller sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/login"
                className="mt-2 flex w-full items-center justify-center rounded-lg py-2 text-[11px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Buyer sign in
              </Link>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-black text-amber-900">No fees to join</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Opening a shop is free. Shoply only earns when you make a sale, so there is no
                risk in applying.
              </p>
            </div>
          </aside>
        </div>

        {/* Form */}
        <section id="apply" className="mt-10 scroll-mt-20 border-t border-zinc-200 pt-10">
          <div className="mx-auto w-full max-w-2xl">
            <h2 className="text-center text-2xl font-black text-zinc-950">
              Create your seller account
            </h2>
            <p className="mt-1.5 text-center text-xs text-zinc-500">
              Three quick steps. You can review everything before you submit.
            </p>

            <div className="mt-7">
              <SellerApplicationForm />
            </div>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Just here to shop?{' '}
              <Link to="/login" className="font-bold text-zinc-950 hover:underline">
                Sign in
              </Link>{' '}
              or{' '}
              <Link to="/register" className="font-bold text-zinc-950 hover:underline">
                create a buyer account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
