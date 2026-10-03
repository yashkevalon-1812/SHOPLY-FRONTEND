import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Store,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const ForgotPassword = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Wizard Step: 1 = Enter Email, 2 = Enter OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Email
  const [email, setEmail] = useState('');
  const [testPreviewUrl, setTestPreviewUrl] = useState(null);
  const [isRealSmtp, setIsRealSmtp] = useState(true);

  // Step 2: 6-Digit OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  // Step 3: Passwords
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first OTP box when entering Step 2
  useEffect(() => {
    if (step === 2 && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Handle Step 1: Submit Email
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your registered email address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      addToast(data.message || 'Verification code dispatched', 'success');

      setTestPreviewUrl(data.testPreviewUrl || null);
      setIsRealSmtp(data.isRealSmtp ?? true);

      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send verification code', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP digit box change
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, ''); // Numeric only

    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single digit
    const digit = cleanValue.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (index < 5 && digit) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      addToast('Please enter the full 6-digit verification code', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: fullOtp,
      });
      addToast(data.message || 'Verification confirmed!', 'success');
      setStep(3);
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid or expired verification code', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const fullOtp = otpDigits.join('');
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: fullOtp,
        newPassword,
      });

      addToast(data.message || 'Password reset successful!', 'success');
      setStep(4);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill preset helper for local testing
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    addToast(`Selected ${demoEmail}`, 'info');
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1a2f50] dark:bg-amber-500 flex items-center justify-center font-black text-white dark:text-slate-950 text-xl shadow-md group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">Shoply</span>
          </Link>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white pt-2">
            {step === 1 && 'Reset Your Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Reset Complete'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
            {step === 1 && 'Enter your registered email address to receive a secure 6-digit verification code.'}
            {step === 2 && `We sent a 6-digit verification code to ${email}. Check your inbox and spam folder.`}
            {step === 3 && 'Choose a strong, unique passcode for your Shoply account.'}
            {step === 4 && 'Your credentials have been securely updated. You can now sign in.'}
          </p>
        </div>

        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-amber-500' : 'w-3 bg-slate-200 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-amber-500' : 'w-3 bg-slate-200 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-amber-500' : 'w-3 bg-slate-200 dark:bg-slate-800'}`}></div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: ENTER REGISTERED EMAIL
           ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick-Fill Demo Chips */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Quick Fill Demo Accounts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@velora.com')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-zinc-50 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">Admin (Velora)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('yashvaghasiya1812@gmail.com')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-zinc-50 dark:hover:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Seller Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('yashvaghasiya2006@gmail.com')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-zinc-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Buyer Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin@shoply.com')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-zinc-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Admin (Shoply)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-3.5 rounded-xl transition-all hover:scale-102 active:scale-98 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Generating Verification Code...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            STEP 2: ENTER 6-DIGIT OTP
           ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {/* Real Email Dispatched Alert */}
            <div className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-950 dark:text-white text-xs mb-0.5">
                  {isRealSmtp ? 'Check Your Email Inbox' : 'Email Dispatched (Setup Needed for Gmail)'}
                </p>
                <p>
                  We have dispatched a 6-digit verification code for{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">{email}</span>.
                  {isRealSmtp
                    ? ' Please check your inbox (and Spam / Junk folder if not visible immediately).'
                    : ' Real Gmail credentials are not yet configured in backend .env.'}
                </p>
              </div>
            </div>

            {/* Test Preview Banner when EMAIL_USER is not yet set in .env */}
            {testPreviewUrl && (
              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Development Mail Sandbox
                  </span>
                  <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded-md">
                    Click to View Email
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your server generated and delivered the email via test mailer sandbox. You can open and read the exact email and 6-digit OTP in your browser right now:
                </p>
                <a
                  href={testPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Sent Email in Browser (Ethereal) ↗</span>
                </a>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl text-xs">
              <div className="space-y-3">
                <label className="text-slate-700 dark:text-slate-300 font-bold block text-center">
                  Enter 6-Digit Code
                </label>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-xl border transition-all ${
                        digit
                          ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-slate-950 dark:text-white ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP Counter */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono">
                    Resend in {countdown}s
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || otpDigits.join('').length < 6}
                className="w-full bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-3.5 rounded-xl transition-all hover:scale-102 active:scale-98 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Verifying Code...' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            STEP 3: CREATE NEW PASSWORD
           ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl text-xs animate-fade-in">
            {/* New Password */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 pl-10 pr-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Strength:</span>
                    <span className={strength.score === 3 ? 'text-emerald-600 dark:text-emerald-400' : strength.score === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600'}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-1 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                    <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                    <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 pl-10 pr-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !newPassword || newPassword !== confirmPassword}
              className="w-full bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-3.5 rounded-xl transition-all hover:scale-102 active:scale-98 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span>{submitting ? 'Resetting Password...' : 'Save New Password & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* =========================================================================
            STEP 4: SUCCESS CONFIRMATION
           ========================================================================= */}
        {step === 4 && (
          <div className="bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Credentials Updated</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Your password has been changed successfully. You can now log into your account using your new passcode.
              </p>
            </div>

            <Link
              to="/login"
              className="block w-full bg-[#171717] hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold py-3.5 rounded-xl transition-all hover:scale-102 active:scale-98 shadow-md"
            >
              Proceed to Sign In
            </Link>
          </div>
        )}

        {/* Bottom Switcher: Back to Login */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-bold text-slate-900 dark:text-amber-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
