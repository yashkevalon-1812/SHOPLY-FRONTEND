import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle,
  X,
  Lock,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export const RazorpaySandboxModal = ({
  isOpen,
  onClose,
  paymentData,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrError, setQrError] = useState(false);
  const [isQrPulsing, setIsQrPulsing] = useState(false);
  const [desktopNotice, setDesktopNotice] = useState(null);

  const orderAmount = Number(paymentData?.totalPrice || 0);
  const formattedAmount = orderAmount.toFixed(2);
  const payeeVpa = '8849669921@fam';
  const payeeName = 'yash vaghasiya';
  const orderShortId = paymentData?.orderId ? paymentData.orderId.slice(-8).toUpperCase() : '';
  const transactionNote = `Shoply Order ${orderShortId}`.trim();

  // Dynamic NPCI UPI URI with exact amount pre-filled
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  useEffect(() => {
    let isMounted = true;
    if (orderAmount > 0) {
      QRCode.toDataURL(upiUri, {
        width: 250,
        margin: 1.5,
        color: {
          dark: '#020617', // slate-950
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          if (isMounted) {
            setQrCodeDataUrl(url);
            setQrError(false);
          }
        })
        .catch((err) => {
          console.error('Failed to generate dynamic UPI QR:', err);
          if (isMounted) setQrError(true);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [upiUri, orderAmount]);

  if (!isOpen || !paymentData) return null;

  const handleSimulateSuccess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const mockPaymentId = `pay_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const mockSignature = `mock_sig_${Date.now()}`;
      onPaymentSuccess({
        razorpay_order_id: paymentData.razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      });
    }, 1200);
  };

  const handleCancel = () => {
    onClose();
    if (onPaymentCancel) onPaymentCancel();
  };

  const handleRedirectToApp = (app) => {
    const ua = navigator?.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const isMobile = isAndroid || isIOS;

    const appConfig = {
      gpay: {
        name: 'Google Pay',
        package: 'com.google.android.apps.nbu.paisa.user',
        iosScheme: 'gpay://upi/pay',
      },
      phonepe: {
        name: 'PhonePe',
        package: 'com.phonepe.app',
        iosScheme: 'phonepe://upi/pay',
      },
      paytm: {
        name: 'Paytm',
        package: 'net.one97.paytm',
        iosScheme: 'paytmmp://pay',
      },
      any: {
        name: 'UPI App',
        package: null,
        iosScheme: 'upi://pay',
      },
    };

    const targetConfig = appConfig[app] || appConfig.any;
    const baseParams = `pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    if (isMobile) {
      let targetUrl = `upi://pay?${baseParams}`;

      if (isAndroid) {
        if (targetConfig.package) {
          targetUrl = `intent://pay?${baseParams}#Intent;scheme=upi;package=${targetConfig.package};end`;
        } else {
          targetUrl = `upi://pay?${baseParams}`;
        }
      } else if (isIOS) {
        targetUrl = `${targetConfig.iosScheme}?${baseParams}`;
      }

      try {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = `upi://pay?${baseParams}`;
      }
    } else {
      // Desktop computer (Windows / Mac) where mobile URI handlers don't exist
      // 1. Copy UPI ID to clipboard
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(payeeVpa).catch(() => {});
      }

      // 2. Pulse QR code visually
      setIsQrPulsing(true);
      setTimeout(() => setIsQrPulsing(false), 2500);

      // 3. Set desktop guidance notice
      setDesktopNotice({
        app: targetConfig.name,
        message: `Open ${targetConfig.name} on your phone and scan the QR code above to pay ${formatINR(orderAmount)} directly. (UPI ID copied to clipboard)`,
      });

      // 4. Show friendly toast
      if (addToast) {
        addToast(
          `Open ${targetConfig.name} on your phone & scan QR code to pay ${formatINR(orderAmount)}. UPI ID copied to clipboard!`,
          'info',
          4000
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden transition-all text-zinc-900 dark:text-white">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-5 text-white relative">
          <button
            onClick={handleCancel}
            disabled={processing}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              Razorpay Sandbox Simulator
            </span>
            <span className="text-blue-200 text-xs font-mono">Test Gateway</span>
          </div>

          <h2 className="text-xl font-black">Shoply Checkout</h2>
          <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/20">
            <div className="text-xs text-blue-100">
              Order Ref: <span className="font-mono font-bold">#{paymentData.orderId?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="text-xl font-black text-amber-300">
              {formatINR(paymentData.totalPrice)}
            </div>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 border-b border-zinc-200 dark:border-slate-800 pb-3">
            {[
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'card', label: 'Cards', icon: CreditCard },
              { id: 'netbanking', label: 'NetBanking', icon: Building2 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* UPI View */}
          {activeTab === 'upi' && (
            <div className="space-y-3">
              {/* Dynamic UPI QR Box */}
              <div className="bg-slate-900 rounded-2xl p-5 text-center border border-slate-700 shadow-inner flex flex-col items-center">
                {/* QR Container */}
                <div
                  className={`bg-white p-3 rounded-2xl shadow-md inline-block max-w-[210px] mb-2 text-center transition-all duration-300 ${
                    isQrPulsing
                      ? 'ring-4 ring-emerald-400 scale-105 shadow-emerald-500/40 shadow-lg'
                      : 'ring-0'
                  }`}
                >
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`Dynamic UPI QR Code for ₹${orderAmount} - yash vaghasiya`}
                      className="w-full h-auto rounded-xl object-contain max-h-[195px] mx-auto"
                    />
                  ) : qrError ? (
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code - yash vaghasiya"
                      className="w-full h-auto rounded-xl object-contain max-h-[195px] mx-auto"
                    />
                  ) : (
                    <div className="w-[190px] h-[190px] flex items-center justify-center bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-500 font-medium animate-pulse">
                        Generating ₹{orderAmount} QR...
                      </span>
                    </div>
                  )}

                </div>


                <p className="text-[11px] text-slate-400 mt-1">
                  Scan QR with any app or tap below to pay ₹{orderAmount} directly:
                </p>

                {/* Direct App Pay Buttons (GPay, PhonePe, Paytm) */}
                <div className="w-full mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block text-center">
                    Tap to Open App Directly:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => handleRedirectToApp('gpay')}
                      className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer font-bold text-[11px]"
                      title={`Pay ₹${orderAmount} with Google Pay`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>GPay</span>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => handleRedirectToApp('phonepe')}
                      className="bg-[#5f259f] hover:bg-[#521f8a] text-white py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer font-bold text-[11px]"
                      title={`Pay ₹${orderAmount} with PhonePe`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#5f259f] font-black text-xs leading-none">
                        पे
                      </div>
                      <span>PhonePe</span>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => handleRedirectToApp('paytm')}
                      className="bg-[#002e6e] hover:bg-[#002558] text-white py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer font-bold text-[11px]"
                      title={`Pay ₹${orderAmount} with Paytm`}
                    >
                      <span className="font-black text-xs text-[#00baf2] tracking-tighter leading-none">
                        pay<span className="text-white">tm</span>
                      </span>
                      <span>Paytm</span>
                    </button>
                  </div>

                  {/* Fallback to any generic UPI app */}
                  <button
                    type="button"
                    onClick={() => handleRedirectToApp('any')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 mt-1 active:scale-98"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pay with Any UPI App (₹{orderAmount})</span>
                  </button>

                  {/* Desktop Guidance / Mobile Notice */}
                  {desktopNotice && (
                    <div className="w-full bg-slate-800/90 border border-emerald-500/50 rounded-xl p-3 text-[11px] text-slate-200 flex items-start gap-2.5 text-left mt-2 shadow-md animate-fadeIn">
                      <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <span className="font-bold text-white">{desktopNotice.app}: </span>
                        <span>{desktopNotice.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDesktopNotice(null)}
                        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cards View */}
          {activeTab === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-zinc-700 dark:text-slate-300 mb-1">
                  Test Card Number
                </label>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242"
                  className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block text-zinc-700 dark:text-slate-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12/29"
                    className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block text-zinc-700 dark:text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="789"
                    className="w-full bg-zinc-50 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded-xl p-3 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NetBanking View */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <label className="text-xs font-bold block text-zinc-700 dark:text-slate-300">
                Select Popular Bank
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank'].map(
                  (bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedBank === bank
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'border-zinc-200 dark:border-slate-700 bg-zinc-50 dark:bg-slate-800 hover:border-zinc-300'
                      }`}
                    >
                      {bank}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleSimulateSuccess}
            disabled={processing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.01]"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirm Payment of {formatINR(paymentData.totalPrice)}
              </span>
            )}
          </button>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-slate-400 pt-2 border-t border-zinc-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Razorpay Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
