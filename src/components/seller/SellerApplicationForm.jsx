import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  User,
  Store,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Phone,
  Check,
  Pencil,
  Eye,
  EyeOff,
  Building2,
  UserCircle,
  MapPin,
  Landmark,
  Info,
} from 'lucide-react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const POSTAL_PATTERN = /^[A-Za-z0-9\s-]{3,10}$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_PATTERN = /^\d{9,18}$/;

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

const scorePassword = (value) => {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
};

// Amazon's signature branch: the flow simplifies when there's no incorporated
// business behind the shop.
const BUSINESS_TYPES = [
  {
    value: 'individual',
    icon: UserCircle,
    title: 'None, I am an individual',
    description: 'You sell as yourself, with no registered company.',
  },
  {
    value: 'registered',
    icon: Building2,
    title: 'I have a registered business',
    description: 'You sell on behalf of an incorporated company or firm.',
  },
];

const STEP_LABELS = ['Business', 'Your details', 'Payouts', 'Review'];

const inputClass =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 pl-11 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/10';

const bareClass =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/10';

const okClass = 'border-zinc-300 focus:border-amber-500';
const errClass = 'border-red-400 focus:border-red-500 focus:ring-red-500/10';

const Field = ({ label, hint, required, error, icon: Icon, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label className="text-xs font-bold text-zinc-800">
        {label}
        {required && <span className="ml-0.5 text-amber-600">*</span>}
      </label>
      {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
    </div>
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />}
      {children}
    </div>
    {error && <p className="mt-1.5 text-[11px] font-semibold text-red-600">{error}</p>}
  </div>
);

const ReviewRow = ({ label, value, onEdit }) => (
  <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-3 last:border-0">
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-0.5 truncate text-sm text-zinc-900">{value || '—'}</p>
    </div>
    {onEdit && (
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-600 transition-colors hover:text-amber-700"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    )}
  </div>
);

const Stepper = ({ current, onJump }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const done = stepNumber < current;
            const active = stepNumber === current;
            const clickable = stepNumber < current;

            return (
              <div key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onJump(stepNumber)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-amber-500 text-white'
                      : active
                        ? 'bg-[#1a2f50] text-white'
                        : 'bg-zinc-100 text-zinc-400'
                  } ${clickable ? 'cursor-pointer hover:bg-amber-600' : 'cursor-default'}`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : stepNumber}
                </button>
                <span
                  className={`hidden text-xs font-bold sm:block ${
                    active ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
                >
                  {label}
                </span>
                {stepNumber < STEP_LABELS.length && (
                  <span className="mx-1 h-px w-4 bg-zinc-200 sm:w-6" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((current - 1) / (STEP_LABELS.length - 1)) * 100}%` }}
          />
        </div>
  </div>
);

export const SellerApplicationForm = ({ compact = false }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [businessType, setBusinessType] = useState('individual');
  const [shopName, setShopName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountType, setAccountType] = useState('savings');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isRegistered = businessType === 'registered';
  const strength = useMemo(() => scorePassword(password), [password]);

  const validateStep = (target) => {
    const found = {};

    if (target === 1) {
      if (!shopName.trim()) found.shopName = 'Enter your shop or brand name';
      else if (shopName.trim().length < 3) found.shopName = 'Use at least 3 characters';
      if (!storeDescription.trim())
        found.storeDescription = 'Tell buyers what your workshop specialises in';
      else if (storeDescription.trim().length < 20)
        found.storeDescription = 'Add a little more detail (20 characters minimum)';

      if (isRegistered) {
        if (!street.trim()) found.street = 'Enter your business street address';
        if (!city.trim()) found.city = 'Enter your city';
        if (!state.trim()) found.state = 'Enter your state or region';
        if (!country.trim()) found.country = 'Enter your country';
        if (!postalCode.trim()) found.postalCode = 'Enter your postal code';
        else if (!POSTAL_PATTERN.test(postalCode.trim()))
          found.postalCode = 'Enter a valid postal code';
      }
    }

    if (target === 2) {
      if (!name.trim()) found.name = 'Enter your full legal name';
      if (!email.trim()) found.email = 'Enter your email address';
      else if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Enter a valid email address';
      if (!password) found.password = 'Choose a password';
      else if (password.length < 6) found.password = 'Use at least 6 characters';
      if (!phone.trim()) found.phone = 'Enter a contact phone number';
      else if (!PHONE_PATTERN.test(phone.trim())) found.phone = 'Enter a valid phone number';
    }

    if (target === 3) {
      if (!accountHolderName.trim())
        found.accountHolderName = 'Enter the name on your bank account';
      if (!bankName.trim()) found.bankName = 'Enter your bank name';
      if (!accountNumber.trim()) found.accountNumber = 'Enter your account number';
      else if (!ACCOUNT_PATTERN.test(accountNumber.trim()))
        found.accountNumber = 'Account number must be 9-18 digits';
      if (!ifsc.trim()) found.ifsc = 'Enter your IFSC code';
      else if (!IFSC_PATTERN.test(ifsc.trim().toUpperCase()))
        found.ifsc = 'Enter a valid IFSC code (e.g. HDFC0001234)';
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEP_LABELS.length));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const target of [1, 2, 3]) {
      if (!validateStep(target)) {
        setStep(target);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'seller',
        phone: phone.trim(),
        shopName: shopName.trim(),
        storeDescription: storeDescription.trim(),
        businessType,
        address: isRegistered
          ? {
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              postalCode: postalCode.trim(),
              country: country.trim(),
            }
          : undefined,
        payoutDetails: {
          accountHolderName: accountHolderName.trim(),
          bankName: bankName.trim(),
          accountType,
          accountNumber: accountNumber.trim(),
          ifsc: ifsc.trim().toUpperCase(),
        },
      });

      addToast('Application received! Our team will review your shop shortly.', 'success');
      navigate(res.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const businessStep = (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-zinc-800">
          Business type<span className="ml-0.5 text-amber-600">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUSINESS_TYPES.map(({ value, icon: Icon, title, description }) => {
            const selected = businessType === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  selected
                    ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10'
                    : 'border-zinc-300 bg-white hover:border-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value={value}
                  checked={selected}
                  onChange={() => {
                    setBusinessType(value);
                    setErrors({});
                  }}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-zinc-900">{title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                    {description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label="Shop / brand name" required error={errors.shopName} icon={Store}>
        <input
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="e.g. Vance Horology Studio"
          className={`${inputClass} ${errors.shopName ? errClass : okClass}`}
        />
      </Field>

      <Field
        label="Workshop description / specialty"
        required
        error={errors.storeDescription}
        hint={`${storeDescription.trim().length}/20 min`}
      >
        <textarea
          rows={4}
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          placeholder="Detail your artisanal credentials, materials, crafting process and category focus..."
          className={`${bareClass} ${errors.storeDescription ? errClass : okClass}`}
        />
      </Field>

      {isRegistered && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-bold text-zinc-900">Registered business address</p>
          </div>

          <Field label="Street address" required error={errors.street}>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="221B Baker Street"
              className={`${bareClass} ${errors.street ? errClass : okClass}`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" required error={errors.city}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="London"
                className={`${bareClass} ${errors.city ? errClass : okClass}`}
              />
            </Field>
            <Field label="State / region" required error={errors.state}>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Greater London"
                className={`${bareClass} ${errors.state ? errClass : okClass}`}
              />
            </Field>
            <Field label="Postal code" required error={errors.postalCode}>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="NW1 6XE"
                className={`${bareClass} ${errors.postalCode ? errClass : okClass}`}
              />
            </Field>
            <Field label="Country" required error={errors.country}>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United Kingdom"
                className={`${bareClass} ${errors.country ? errClass : okClass}`}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );

  const detailsStep = (
    <div className="space-y-5">
      <Field label="Full legal name" required error={errors.name} icon={User}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Marcus Vance"
          autoComplete="name"
          className={`${inputClass} ${errors.name ? errClass : okClass}`}
        />
      </Field>

      <Field label="Contact phone" required error={errors.phone} icon={Phone}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          className={`${inputClass} ${errors.phone ? errClass : okClass}`}
        />
      </Field>

      <Field label="Email address" required error={errors.email} icon={Mail}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          className={`${inputClass} ${errors.email ? errClass : okClass}`}
        />
      </Field>

      <Field label="Password" required error={errors.password} icon={Lock}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          className={`${inputClass} pr-11 ${errors.password ? errClass : okClass}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-3 text-zinc-400 transition-colors hover:text-zinc-700"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        {password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < strength
                      ? strength <= 1
                        ? 'bg-red-500'
                        : strength === 2
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-zinc-500">
              {STRENGTH_LABELS[strength]}
            </span>
          </div>
        )}
      </Field>
    </div>
  );

  const payoutStep = (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <span>
          Your earnings are paid into this account. Bank details are encrypted before storage and
          are never shown in full after you submit.
        </span>
      </div>

      <Field
        label="Account holder name"
        required
        error={errors.accountHolderName}
        icon={User}
        hint="As it appears on your bank records"
      >
        <input
          type="text"
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
          placeholder="e.g. Priya Rao"
          className={`${inputClass} ${errors.accountHolderName ? errClass : okClass}`}
        />
      </Field>

      <Field label="Bank name" required error={errors.bankName} icon={Landmark}>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. HDFC Bank"
          className={`${inputClass} ${errors.bankName ? errClass : okClass}`}
        />
      </Field>

      <Field
        label="Account number"
        required
        error={errors.accountNumber}
        icon={Landmark}
        hint="9-18 digits"
      >
        <input
          type="password"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
          placeholder="00000000000"
          autoComplete="off"
          className={`${inputClass} ${errors.accountNumber ? errClass : okClass}`}
        />
      </Field>

      <Field
        label="IFSC code"
        required
        error={errors.ifsc}
        icon={Landmark}
        hint="Used to route your payouts"
      >
        <input
          type="text"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value.toUpperCase().replace(/\s/g, ''))}
          placeholder="HDFC0001234"
          autoComplete="off"
          maxLength={11}
          className={`${inputClass} uppercase ${errors.ifsc ? errClass : okClass}`}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-xs font-bold text-zinc-800">
          Account type<span className="ml-0.5 text-amber-600">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { value: 'savings', label: 'Savings account' },
            { value: 'current', label: 'Current account' },
          ].map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3.5 text-xs font-bold transition-colors ${
                accountType === value
                  ? 'border-amber-500 bg-amber-50 text-zinc-900 ring-4 ring-amber-500/10'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value={value}
                checked={accountType === value}
                onChange={() => setAccountType(value)}
                className="sr-only"
              />
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  accountType === value ? 'border-amber-500 bg-amber-500' : 'border-zinc-300'
                }`}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );

  const reviewStep = (
    <div>
      <ReviewRow
        label="Business type"
        value={isRegistered ? 'Registered business' : 'Individual'}
        onEdit={() => setStep(1)}
      />
      <ReviewRow label="Shop / brand name" value={shopName} onEdit={() => setStep(1)} />
      <ReviewRow label="Specialty" value={storeDescription} onEdit={() => setStep(1)} />
      {isRegistered && (
        <ReviewRow
          label="Business address"
          value={[street, city, state, postalCode, country].filter(Boolean).join(', ')}
          onEdit={() => setStep(1)}
        />
      )}
      <ReviewRow label="Full legal name" value={name} onEdit={() => setStep(2)} />
      <ReviewRow label="Contact phone" value={phone} onEdit={() => setStep(2)} />
      <ReviewRow label="Email address" value={email} onEdit={() => setStep(2)} />
      <ReviewRow
        label="Payout account"
        value={`${bankName} · ${accountNumber.slice(-4).padStart(accountNumber.length, '•')} · ${ifsc.slice(-4)}`}
        onEdit={() => setStep(3)}
      />
      <ReviewRow
        label="Account holder"
        value={`${accountHolderName} (${accountType})`}
        onEdit={() => setStep(3)}
      />
    </div>
  );

  const stepTitle = () => {
    if (step === 1) return 'Business information';
    if (step === 2) return 'Your details';
    if (step === 3) return 'Payout details';
    return 'Review your application';
  };

  return (
    <div className={compact ? 'space-y-6' : 'space-y-6'}>
      <Stepper
        current={step}
        onJump={(target) => {
          setErrors({});
          setStep(target);
        }}
      />

      {step === 1 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Merchant verification:</strong> shop accounts are reviewed by our team
            before listing privileges are enabled.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm"
      >
        <div className="border-b border-zinc-200 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
            Step {step} of {STEP_LABELS.length}
          </p>
          <h2 className="mt-0.5 text-lg font-black text-zinc-950">{stepTitle()}</h2>
        </div>

        {step === 1 && businessStep}
        {step === 2 && detailsStep}
        {step === 3 && payoutStep}
        {step === 4 && reviewStep}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step < STEP_LABELS.length ? (
            <button
              type="button"
              onClick={goNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a2f50] py-3 text-xs font-bold text-white transition-colors hover:bg-[#14243e]"
            >
              Continue
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit application'}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
