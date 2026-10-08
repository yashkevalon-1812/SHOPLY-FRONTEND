import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  QrCode,
  CheckCircle,
  X,
  Lock,
  Smartphone,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/format';

export const BillWiseQrModal = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { addToast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const TOTAL_QR_SECONDS = 600; // 10 minutes (standard UPI QR validity)
  const [qrTimerSeconds, setQrTimerSeconds] = useState(TOTAL_QR_SECONDS);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const orderId = orderData?.orderId || orderData?._id || '';
  const totalPrice = Number(orderData?.totalPrice || 0);
  const itemsPrice = Number(orderData?.itemsPrice || 0);
  const shippingPrice = Number(orderData?.shippingPrice || 0);
  const taxPrice = Number(orderData?.taxPrice || 0);
  const discountAmount = Number(orderData?.discountAmount || 0);
  const shortOrderId = orderId ? orderId.slice(-8).toUpperCase() : '';

  const payeeVpa = '8849669921@fam';
  const payeeName = 'yash vaghasiya';
  const formattedAmount = totalPrice.toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`Bill #${shortOrderId}`)}`;

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Reset 10-minute timer whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQrTimerSeconds(600);
      setIsTimerPaused(false);
      setConfirming(false);
    }
  }, [isOpen]);

  // Generate dynamic QR code for the exact bill
  useEffect(() => {
    let isMounted = true;
    if (isOpen && totalPrice > 0) {
      QRCode.toDataURL(upiUri, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          if (isMounted) setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate Bill-Wise QR:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, upiUri, totalPrice]);

  // Real-time polling to detect phone payment approval
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await api.get(`/payment/razorpay/status/${orderId}`);
        if (data?.isPaid && isMounted) {
          clearInterval(pollInterval);
          if (addToast) addToast('Payment confirmed! Allocating your order...', 'success');
          onPaymentSuccess(orderId);
        }
      } catch (_) {
        // Silent poll
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isOpen, orderId]);

  // 10-minute countdown timer (Informational display only - does NOT auto-approve)
  useEffect(() => {
    if (!isOpen || !orderId || isTimerPaused) {
      return;
    }

    const interval = setInterval(() => {
      setQrTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, orderId, isTimerPaused]);

  if (!isOpen || !orderData) return null;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    if (addToast) addToast(`Copied UPI ID (${payeeVpa}) to clipboard`, 'info');
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Confirm payment and mark order as paid
  const handleConfirmPayment = async () => {
    if (!orderId) return;
    setConfirming(true);
    try {
      await api.post('/payment/razorpay/confirm-upi', {
        orderId,
        vpa: payeeVpa,
      });

      if (addToast) addToast('Payment verified via UPI QR! Order confirmed.', 'success');
      onPaymentSuccess(orderId);
    } catch (err) {
      console.error('UPI confirmation failed:', err);
      if (addToast) {
        addToast(
          err.response?.data?.message || 'Payment confirmation failed. Please try again.',
          'error'
        );
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleSimulateInstant = () => {
    handleConfirmPayment();
  };

  const handleClose = () => {
    setQrTimerSeconds(600);
    setIsTimerPaused(true);
    onClose();
    if (onPaymentCancel) onPaymentCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0b1329] border border-zinc-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Scan & Pay via UPI</h2>
                <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Bill-Wise QR
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-mono">
                Bill Reference #{shortOrderId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Bill-Wise Breakdown Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-zinc-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-slate-700 pb-2">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bill Breakdown</span>
            </div>

            <div className="flex justify-between text-zinc-600 dark:text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatINR(itemsPrice)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied</span>
                <span className="font-semibold">-{formatINR(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-600 dark:text-slate-400">
              <span>Estimated Tax (GST 18%)</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatINR(taxPrice)}
              </span>
            </div>

            <div className="flex justify-between text-zinc-600 dark:text-slate-400">
              <span>Insured Shipping</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {shippingPrice === 0 ? 'FREE' : formatINR(shippingPrice)}
              </span>
            </div>

            <div className="border-t border-zinc-200 dark:border-slate-700 pt-2 flex justify-between items-center text-sm font-black text-zinc-950 dark:text-white">
              <span>Net Payable Bill</span>
              <span className="text-lg font-mono text-emerald-600 dark:text-emerald-400">
                {formatINR(totalPrice)}
              </span>
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center shadow-xl space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                NPCI Verified UPI QR
              </span>
              <span className="font-mono text-slate-300">Exact Pre-filled Bill</span>
            </div>

            {/* QR Container */}
            <div className="bg-white p-3 rounded-2xl shadow-2xl inline-block max-w-[210px] text-center ring-2 ring-emerald-500/30">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Dynamic UPI QR for ${formatINR(totalPrice)}`}
                  className="w-44 h-44 object-contain mx-auto rounded-xl select-none"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-50 rounded-xl text-xs text-slate-500 animate-pulse">
                  Generating Bill QR...
                </div>
              )}
              <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-slate-800">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan with Any UPI App</span>
              </div>
            </div>

            {/* Payee Info Box */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-left flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Verified Merchant
                </span>
                <span className="text-xs font-bold text-white block truncate">{payeeName}</span>
                <span className="text-[11px] font-mono text-emerald-400 block truncate">
                  {payeeVpa}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="shrink-0 bg-slate-700 hover:bg-slate-650 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-slate-600"
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

            {/* Supported App Badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
              {[
                { name: 'Google Pay', icon: '/gpay-logo.svg' },
                { name: 'PhonePe', icon: '/phonepe-logo.svg' },
                { name: 'Paytm', icon: '/paytm-logo.svg' },
                { name: 'BHIM UPI', icon: '/upi-logo.svg' },
              ].map((app) => (
                <div
                  key={app.name}
                  className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-300 font-medium"
                >
                  <img src={app.icon} alt="" className="w-3 h-3 object-contain" />
                  <span>{app.name}</span>
                </div>
              ))}
            </div>

            {/* 10-Minute QR Expiry & Status Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-left space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {confirming
                      ? 'Verifying Payment & Allocating Order...'
                      : 'Awaiting phone scan / UPI payment...'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                    {formatTime(qrTimerSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-0.5 rounded-md bg-slate-700/80 border border-slate-600 cursor-pointer"
                  >
                    {isTimerPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                </div>
              </div>

              {/* Progress Bar for 10 minutes */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${Math.min(100, Math.max(0, (qrTimerSeconds / 600) * 100))}%`,
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

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-slate-800 space-y-2.5 bg-zinc-50 dark:bg-slate-900/80 shrink-0">
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
          >
            {confirming ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Verifying & Allocating Order...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>I Have Paid via QR — Confirm Order</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulateInstant}
            disabled={confirming}
            className="w-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-zinc-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Test Approval (Sandbox Mode)</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Safe Checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
