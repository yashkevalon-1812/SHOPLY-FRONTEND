import api from '../api/axios';

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 * @returns {Promise<boolean>} True if script loaded and window.Razorpay exists
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load official Razorpay checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Fetch Razorpay public key ID & configuration status from backend
 */
export const getRazorpayConfig = async () => {
  try {
    const { data } = await api.get('/payment/razorpay/key');
    return data;
  } catch (err) {
    console.error('Failed to get Razorpay configuration:', err);
    return {
      success: false,
      keyId: 'rzp_test_mock',
      isRealKeys: false,
      currency: 'INR',
    };
  }
};
