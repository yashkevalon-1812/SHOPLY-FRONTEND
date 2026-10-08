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
  Clock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export const RazorpaySandboxModal = ({
  isOpen,
  onClose,
  paymentData,
  onPaymentSuccess,
  onPaymentCancel,
  initialTab = 'qr',
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab || 'qr'); // 'qr' | 'upi-apps' | 'card' | 'netbanking'
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showQrInCollect, setShowQrInCollect] = useState(false);
  const [collectNotice, setCollectNotice] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrError, setQrError] = useState(false);
  const [isQrPulsing, setIsQrPulsing] = useState(false);
  const [desktopNotice, setDesktopNotice] = useState(null);
  const [payerUpiId, setPayerUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [collectRequest, setCollectRequest] = useState(null); // { active, upiId, app, timeLeft }
  const TOTAL_QR_SECONDS = 600; // 10 minutes
  const [qrAutoTimer, setQrAutoTimer] = useState(TOTAL_QR_SECONDS);
  const [isQrAutoPaused, setIsQrAutoPaused] = useState(false);

  const orderAmount = Number(paymentData?.totalPrice || 0);
  const formattedAmount = orderAmount.toFixed(2);
  const payeeVpa = '8849669921@fam';
  const payeeName = 'yash vaghasiya';
  const orderShortId = paymentData?.orderId ? paymentData.orderId.slice(-8).toUpperCase() : '';
  const transactionNote = `Shoply Order ${orderShortId}`.trim();

  // Dynamic NPCI UPI URI with exact amount pre-filled
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Reset and synchronize activeTab when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'qr');
      setQrAutoTimer(600);
      setIsQrAutoPaused(false);
    } else {
      setCollectRequest(null);
      setPayerUpiId('');
      setUpiIdError('');
      setDesktopNotice(null);
      setCopiedVpa(false);
    }
  }, [isOpen, initialTab]);

  // Reset QR auto timer when switching tabs
  useEffect(() => {
    if (isOpen && activeTab === 'qr') {
      setQrAutoTimer(600);
      setIsQrAutoPaused(false);
    }
  }, [isOpen, activeTab]);

  // QR tab 10-minute countdown timer (Informative only - does NOT auto-approve)
  useEffect(() => {
    if (!isOpen || activeTab !== 'qr' || isQrAutoPaused) {
      return;
    }

    const interval = setInterval(() => {
      setQrAutoTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, isQrAutoPaused]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    if (addToast) addToast(`Copied UPI ID (${payeeVpa}) to clipboard`, 'info');
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Countdown timer for pending collect request
  useEffect(() => {
    if (!collectRequest?.active) return;
    const interval = setInterval(() => {
      setCollectRequest((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          if (addToast) addToast('UPI collect request expired. Please try again.', 'error');
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [collectRequest?.active]);

  // Real-time polling for payment status (auto-detects approval from phone/UPI app)
  useEffect(() => {
    if (!isOpen || (!collectRequest?.active && activeTab !== 'qr')) return;
    const orderId = paymentData?.orderId;
    if (!orderId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await api.get(`/payment/razorpay/status/${orderId}`);
        if (data?.isPaid && isMounted) {
          clearInterval(pollInterval);
          if (addToast) addToast('Payment confirmed on your UPI app! Allocating order...', 'success');
          setCollectRequest(null);
          onPaymentSuccess({
            razorpay_order_id: paymentData.razorpayOrderId,
            razorpay_payment_id: `pay_upi_${Date.now()}`,
            razorpay_signature: `mock_sig_${Date.now()}`,
          });
        }
      } catch (err) {
        // Silent poll error
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, collectRequest?.active, activeTab, paymentData?.orderId]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const detectUpiApp = (upiId) => {
    const handle = (upiId || '').toLowerCase().split('@')[1] || '';
    if (/^(okaxis|okhdfcbank|okicici|oksbi)$/.test(handle)) {
      return {
        name: 'Google Pay',
        logo: '/gpay-logo.svg',
        color: '#4285F4',
        key: 'gpay',
        package: 'com.google.android.apps.nbu.paisa.user',
        iosScheme: 'gpay://upi/pay',
      };
    }
    if (/^(ybl|ibl|axl)$/.test(handle)) {
      return {
        name: 'PhonePe',
        logo: '/phonepe-logo.svg',
        color: '#5F259F',
        key: 'phonepe',
        package: 'com.phonepe.app',
        iosScheme: 'phonepe://upi/pay',
      };
    }
    if (/^(paytm|ptsbi|ptaxis|pthdfc)$/.test(handle)) {
      return {
        name: 'Paytm',
        logo: '/paytm-logo.svg',
        color: '#002970',
        key: 'paytm',
        package: 'net.one97.paytm',
        iosScheme: 'paytmmp://pay',
      };
    }
    if (/^(fam|famcard)$/.test(handle)) {
      return {
        name: 'FamApp',
        logo: '/upi-logo.svg',
        color: '#F59E0B',
        key: 'any',
        package: null,
        iosScheme: 'upi://pay',
      };
    }
    if (/^(cred)$/.test(handle)) {
      return {
        name: 'CRED',
        logo: '/upi-logo.svg',
        color: '#18181B',
        key: 'any',
        package: null,
        iosScheme: 'upi://pay',
      };
    }
    return {
      name: 'UPI App',
      logo: '/upi-logo.svg',
      color: '#059669',
      key: 'any',
      package: null,
      iosScheme: 'upi://pay',
    };
  };

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

  const handlePayViaUpiId = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = payerUpiId.trim();
    if (!trimmed) {
      setUpiIdError('Please enter a valid UPI ID');
      return;
    }
    if (!trimmed.includes('@')) {
      setUpiIdError('UPI ID must include "@" (e.g. mobile@upi or name@oksbi)');
      return;
    }
    setUpiIdError('');
    const targetApp = detectUpiApp(trimmed);
    setProcessing(true);

    try {
      // 1. Dispatch collect request to backend
      const { data } = await api.post('/payment/razorpay/upi-collect', {
        orderId: paymentData.orderId,
        vpa: trimmed,
      });

      if (data?.gatewayNotice && !data?.collectDispatched) {
        setCollectNotice(data.gatewayNotice);
        setShowQrInCollect(true);
      } else {
        setCollectNotice('');
      }

      // 2. Activate collect request waiting screen
      setCollectRequest({
        active: true,
        upiId: trimmed,
        app: targetApp,
        timeLeft: 300,
      });

      // 3. If on mobile device, immediately launch the target UPI app
      const ua = navigator?.userAgent || '';
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
      if (isMobile) {
        handleRedirectToApp(targetApp.key);
      }

      if (addToast) {
        addToast(
          `Approval request dispatched to ${targetApp.name} (${trimmed})! Check your phone to approve.`,
          'info',
          5000
        );
      }
    } catch (err) {
      console.error('Failed to dispatch UPI collect request:', err);
      // Still display waiting screen for user
      setCollectRequest({
        active: true,
        upiId: trimmed,
        app: targetApp,
        timeLeft: 300,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data } = await api.post('/payment/razorpay/confirm-upi', {
        orderId: paymentData.orderId,
        vpa: collectRequest?.upiId || payerUpiId || 'UPI Payment',
      });

      if (addToast) addToast('Payment confirmed! Allocating your order...', 'success');
      setCollectRequest(null);
      onPaymentSuccess({
        razorpay_order_id: paymentData.razorpayOrderId,
        razorpay_payment_id: data.razorpay_payment_id || `UPI-${Date.now()}`,
        razorpay_signature: `mock_sig_${Date.now()}`,
      });
    } catch (err) {
      console.error('Status check error:', err);
      if (addToast) {
        addToast(
          err.response?.data?.message || 'Payment approval pending on your UPI app. Please approve on phone.',
          'warning'
        );
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCancel = () => {
    setCollectRequest(null);
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
        window.location.href = targetUrl;
      } catch {
        window.location.href = `upi://pay?${baseParams}`;
      }
    } else {
      // Desktop computer (Windows / Mac) where mobile URI handlers don't exist
      // 1. Copy UPI ID to clipboard
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(payeeVpa).catch(() => {});
      }

      // 2. Automatically switch to QR tab so user can scan with their phone
      setActiveTab('qr');

      // 3. Pulse QR code visually
      setIsQrPulsing(true);
      setTimeout(() => setIsQrPulsing(false), 2500);

      // 4. Set desktop guidance notice
      setDesktopNotice({
        app: targetConfig.name,
        message: `Open ${targetConfig.name} on your phone and scan the dynamic QR code below to pay ${formatINR(orderAmount)} directly.`,
      });

      // 5. Show toast notification
      if (addToast) {
        addToast(
          `Open ${targetConfig.name} on your phone & scan QR code to pay ${formatINR(orderAmount)}.`,
          'info',
          4500
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

        {collectRequest ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            {/* Animated Target App Icon & Pulse Glow */}
            <div className="relative inline-block mx-auto mt-2">
              <div
                className="absolute -inset-2.5 rounded-3xl animate-ping opacity-40"
                style={{ backgroundColor: collectRequest.app.color }}
              ></div>
              <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-zinc-200 dark:border-slate-700 flex items-center justify-center p-3 shadow-xl mx-auto">
                <img
                  src={collectRequest.app.logo}
                  alt={collectRequest.app.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Collect Request Sent to {collectRequest.app.name}</span>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                Approve Payment on Phone
              </h3>
              <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Payment request of{' '}
                <strong className="text-zinc-900 dark:text-white font-bold">{formatINR(paymentData.totalPrice)}</strong>{' '}
                sent to <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{collectRequest.upiId}</span>
              </p>
            </div>

            {/* 3 Step Instructions */}
            <div className="bg-zinc-50 dark:bg-slate-800/80 border border-zinc-200 dark:border-slate-700 rounded-2xl p-4 text-left text-xs space-y-2.5 shadow-inner">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-zinc-700 dark:text-slate-300">
                  Open <strong>{collectRequest.app.name}</strong> on your phone.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-zinc-700 dark:text-slate-300">
                  Check for the payment request of <strong>{formatINR(paymentData.totalPrice)}</strong> from <strong>Shoply</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-zinc-700 dark:text-slate-300">
                  Enter your UPI PIN to approve the payment.
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-slate-400 font-mono">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Expires in:</span>
              <strong className="text-zinc-900 dark:text-white font-bold text-sm bg-zinc-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-slate-700">
                {formatTimer(collectRequest.timeLeft)}
              </strong>
            </div>

            {/* Live Listening Radar Status */}
            <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-3.5 flex items-center justify-center gap-3">
              <div className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600"></span>
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-zinc-900 dark:text-white">
                  Awaiting approval from {collectRequest.app.name}...
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Do not close this page. Order will confirm automatically.
                </div>
              </div>
            </div>

            {/* Notice if Razorpay Key Secret is masked or needs dashboard copy */}
            {collectNotice && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 text-left text-[11px] text-amber-900 dark:text-amber-200 space-y-1 animate-fadeIn">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Push Request Notice</span>
                </div>
                <p className="leading-relaxed">
                  {collectNotice}
                </p>
                <p className="font-semibold text-amber-800 dark:text-amber-300 pt-0.5">
                  👉 Point your phone camera or Google Pay scanner at the dynamic QR below to pay instantly!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              {/* Button to open app directly on phone */}
              <button
                type="button"
                onClick={() => handleRedirectToApp(collectRequest.app.key)}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <div className="w-5 h-5 rounded-full bg-white p-0.5 shrink-0 flex items-center justify-center">
                  <img src={collectRequest.app.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                </div>
                <span>Open {collectRequest.app.name} App on Phone</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </button>

              {/* Check Payment Status Button */}
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-slate-800 dark:hover:bg-slate-750 border border-zinc-200 dark:border-slate-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {checkingStatus ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Checking with {collectRequest.app.name}...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Check Approval Status</span>
                  </>
                )}
              </button>

              {/* Dynamic QR Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQrInCollect(!showQrInCollect)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrInCollect ? 'Hide QR Code' : `Or scan dynamic QR directly with ${collectRequest.app.name}`}</span>
                </button>
                {showQrInCollect && (
                  <div className="mt-2.5 p-3 bg-slate-900 rounded-2xl border border-slate-700 inline-block animate-fadeIn">
                    <div className="bg-white p-2.5 rounded-xl inline-block">
                      <img
                        src={qrCodeDataUrl}
                        alt={`Dynamic UPI QR for ₹${orderAmount}`}
                        className="w-40 h-40 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-[10px] text-slate-300 mt-2 font-mono">
                      Pre-filled amount: {formatINR(paymentData.totalPrice)}
                    </p>
                  </div>
                )}
              </div>

              {/* Change UPI ID / Go Back */}
              <button
                type="button"
                onClick={() => setCollectRequest(null)}
                disabled={checkingStatus}
                className="w-full py-1.5 text-xs font-semibold text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different UPI ID</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-1.5 border-b border-zinc-200 dark:border-slate-800 pb-3">
            {[
              { id: 'qr', label: 'QR Code', icon: QrCode },
              { id: 'upi-apps', label: 'UPI Apps', icon: Smartphone },
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
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 1. UPI View (GPay, PhonePe, Paytm, UPI ID) */}
          {activeTab === 'upi-apps' && (
            <div className="space-y-3">
              <div className="text-center pb-1">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-slate-400">
                  Select your UPI app or enter UPI ID to pay {formatINR(paymentData.totalPrice)}:
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => handleRedirectToApp('gpay')}
                  className="w-full bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-750 border border-zinc-200 dark:border-slate-700 p-3 rounded-2xl flex items-center justify-between shadow-xs transition-all hover:border-blue-500 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-xs shrink-0">
                      <img
                        src="/gpay-logo.svg"
                        alt="Google Pay"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">Google Pay</div>
                      <div className="text-[11px] text-zinc-500 dark:text-slate-400">Fast &amp; Secure UPI</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Pay &rarr;
                  </span>
                </button>

                {/* PhonePe */}
                <button
                  type="button"
                  onClick={() => handleRedirectToApp('phonepe')}
                  className="w-full bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-750 border border-zinc-200 dark:border-slate-700 p-3 rounded-2xl flex items-center justify-between shadow-xs transition-all hover:border-purple-500 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#5F259F] flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                      <img
                        src="/phonepe-logo.svg"
                        alt="PhonePe"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">PhonePe</div>
                      <div className="text-[11px] text-zinc-500 dark:text-slate-400">Instant UPI payment</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                    Pay &rarr;
                  </span>
                </button>

                {/* Paytm */}
                <button
                  type="button"
                  onClick={() => handleRedirectToApp('paytm')}
                  className="w-full bg-zinc-50 dark:bg-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-750 border border-zinc-200 dark:border-slate-700 p-3 rounded-2xl flex items-center justify-between shadow-xs transition-all hover:border-sky-500 cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-xs shrink-0">
                      <img
                        src="/paytm-logo.svg"
                        alt="Paytm"
                        className="w-full h-auto object-contain max-h-5"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">Paytm UPI</div>
                      <div className="text-[11px] text-zinc-500 dark:text-slate-400">Pay via Paytm App</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                    Pay &rarr;
                  </span>
                </button>

                {/* Pay via UPI ID */}
                <div className="bg-zinc-50 dark:bg-slate-800/80 border border-zinc-200 dark:border-slate-700 p-3 rounded-2xl shadow-xs transition-all">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-xs shrink-0">
                      <img
                        src="/upi-logo.svg"
                        alt="UPI ID"
                        className="w-full h-auto object-contain max-h-5"
                      />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">Pay via UPI ID</div>
                      <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                        Enter any UPI ID (e.g. mobile@upi, username@bank)
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handlePayViaUpiId} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={payerUpiId}
                        onChange={(e) => {
                          setPayerUpiId(e.target.value);
                          setUpiIdError('');
                        }}
                        placeholder="e.g. 9876543210@upi or name@oksbi"
                        className="flex-1 bg-white dark:bg-slate-900 border border-zinc-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={processing || !payerUpiId.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-300 dark:disabled:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {processing ? 'Verifying...' : 'Verify & Pay'}
                      </button>
                    </div>
                    {upiIdError && (
                      <p className="text-[10px] text-rose-500 font-medium pl-1">{upiIdError}</p>
                    )}
                  </form>
                </div>
              </div>

              {/* Desktop Notice if on desktop */}
              {desktopNotice && (
                <div className="bg-slate-800/90 border border-emerald-500/50 rounded-xl p-3 text-[11px] text-slate-200 flex items-start gap-2.5 text-left shadow-md animate-fadeIn">
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
          )}

          {/* 2. QR Code View */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-3xl p-5 text-center border border-slate-700/80 shadow-2xl flex flex-col items-center relative overflow-hidden">
                <div className="flex items-center justify-between w-full mb-3 px-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic NPCI UPI QR</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    Amount: {formatINR(paymentData.totalPrice)}
                  </span>
                </div>

                {/* QR Container */}
                <div
                  className={`bg-white p-3.5 rounded-2xl shadow-xl inline-block max-w-[220px] text-center transition-all duration-300 relative ${
                    isQrPulsing
                      ? 'ring-4 ring-emerald-400 scale-105 shadow-emerald-500/40 shadow-lg'
                      : 'ring-1 ring-slate-200'
                  }`}
                >
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`Dynamic UPI QR Code for ₹${orderAmount}`}
                      className="w-full h-auto rounded-xl object-contain max-h-[195px] mx-auto select-none"
                    />
                  ) : qrError ? (
                    <img
                      src="/upi-qr.png"
                      alt="UPI QR Code"
                      className="w-full h-auto rounded-xl object-contain max-h-[195px] mx-auto"
                    />
                  ) : (
                    <div className="w-[190px] h-[190px] flex items-center justify-center bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-500 font-medium animate-pulse">
                        Generating ₹{orderAmount} QR...
                      </span>
                    </div>
                  )}
                  {/* Scan prompt banner below image */}
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-700">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scan with Any UPI App</span>
                  </div>
                </div>

                {/* Payee Info & Copy UPI ID */}
                <div className="mt-3.5 w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-left flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verified Payee</p>
                    <p className="text-xs font-bold text-white truncate">{payeeName}</p>
                    <p className="text-[11px] font-mono text-emerald-400 truncate">{payeeVpa}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="shrink-0 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-600"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Supported Apps Badges */}
                <div className="mt-3 w-full flex items-center justify-center gap-2 flex-wrap">
                  {[
                    { name: 'Google Pay', icon: '/gpay-logo.svg' },
                    { name: 'PhonePe', icon: '/phonepe-logo.svg' },
                    { name: 'Paytm', icon: '/paytm-logo.svg' },
                    { name: 'BHIM UPI', icon: '/upi-logo.svg' },
                  ].map((app) => (
                    <div
                      key={app.name}
                      className="bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-300 font-medium"
                    >
                      <img src={app.icon} alt="" className="w-3 h-3 object-contain" />
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>

                {/* 10-Minute QR Expiry & Status Card */}
                <div className="w-full mt-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {processing
                          ? 'Verifying Payment & Allocating Order...'
                          : 'Awaiting phone scan / UPI payment...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                        {formatTimer(qrAutoTimer)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsQrAutoPaused(!isQrAutoPaused)}
                        className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 rounded-md bg-slate-700/80 border border-slate-600 cursor-pointer"
                      >
                        {isQrAutoPaused ? '▶ Resume' : '⏸ Pause'}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for 10 minutes */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-xs"
                      style={{
                        width: `${Math.min(100, Math.max(0, (qrAutoTimer / 600) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Scan dynamic QR with Google Pay, PhonePe, Paytm, BHIM.</span>
                    <span className="text-slate-300 font-mono">10:00 Mins</span>
                  </div>
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

          {/* Submit Action for Card & NetBanking */}
          {(activeTab === 'card' || activeTab === 'netbanking') && (
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
          )}

          {/* Action for QR Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleSimulateSuccess}
                disabled={processing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying & Allocating Order...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>I Have Paid via QR — Confirm Order</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleSimulateSuccess}
                disabled={processing}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Instant Approval (Sandbox Mode)</span>
              </button>
            </div>
          )}

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
        )}
      </div>
    </div>
  );
};
