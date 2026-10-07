import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle,
  X,
  AlertTriangle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '../../utils/format';

export const RazorpaySandboxModal = ({
  isOpen,
  onClose,
  paymentData,
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrError, setQrError] = useState(false);

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

        {/* Notice Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 p-3 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <p className="leading-tight text-[11px]">
            <strong>{paymentData.warningNotice ? 'Gateway Notice: ' : 'Razorpay Sandbox: '}</strong>
            {paymentData.warningNotice || (
              <>
                Test Gateway active. To activate the official popup, paste your unmasked Razorpay Key Secret in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded font-mono">.env</code>.
              </>
            )}
          </p>
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
                <div className="bg-white p-3 rounded-2xl shadow-md inline-block max-w-[210px] mb-2 text-center">
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

                  {/* Pre-filled Amount Badge right below QR */}
                  <div className="mt-2.5 bg-emerald-600 text-white font-black text-[11px] uppercase py-1 px-3 rounded-full tracking-wider flex items-center justify-center gap-1 shadow-xs">
                    <span>Direct ₹{orderAmount} Pre-filled</span>
                  </div>
                </div>

                <p className="text-white font-black text-sm tracking-wide mt-1">
                  yash vaghasiya
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scan to pay with any UPI app (GPay, PhonePe, Paytm, FamApp)
                </p>

                {/* Direct Mobile UPI Link */}
                <a
                  href={upiUri}
                  className="mt-3 inline-flex sm:hidden items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tap to Open UPI App (Pre-filled ₹{orderAmount})</span>
                </a>
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
