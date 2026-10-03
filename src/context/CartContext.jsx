import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Deterministic isolated storage key per user or guest
const getCartKey = (u) => {
  if (u?._id) return `shoply_cart_user_${u._id}`;
  if (u?.email) return `shoply_cart_user_${u.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return 'shoply_cart_guest';
};

const getCouponKey = (u) => {
  if (u?._id) return `shoply_coupon_user_${u._id}`;
  if (u?.email) return `shoply_coupon_user_${u.email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  return 'shoply_coupon_guest';
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.email || null;

  // Track the previous user ID and user object to detect user transitions
  const prevUserIdRef = useRef(currentUserId);
  const prevUserRef = useRef(user);

  // Helper to load cart from storage for a given user or guest
  const readCartFromStorage = useCallback((u) => {
    try {
      const key = getCartKey(u);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const readCouponFromStorage = useCallback((u) => {
    try {
      const key = getCouponKey(u);
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }, []);

  const [cartItems, setCartItems] = useState(() => readCartFromStorage(user));
  const [couponCode, setCouponCode] = useState(() => readCouponFromStorage(user));

  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(0);

  // Keep a mutable ref of current cartItems & couponCode for transition cleanup
  const cartItemsRef = useRef(cartItems);
  const couponCodeRef = useRef(couponCode);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    couponCodeRef.current = couponCode;
  }, [couponCode]);

  // Cleanup legacy global storage keys on mount
  useEffect(() => {
    localStorage.removeItem('shoply_cart');
    localStorage.removeItem('velora_cart');
    localStorage.removeItem('shoply_coupon');
    localStorage.removeItem('velora_coupon');
  }, []);

  // Detect user login / logout / account switches and isolate carts completely
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const prevUser = prevUserRef.current;

    // Only run when user state actually transitions
    if (prevUserId !== currentUserId) {
      // 1. If a user was previously logged in, ensure their cart is preserved in their storage key
      if (prevUserId) {
        const prevKey = getCartKey(prevUser);
        const prevCouponKey = getCouponKey(prevUser);
        localStorage.setItem(prevKey, JSON.stringify(cartItemsRef.current));
        if (couponCodeRef.current) {
          localStorage.setItem(prevCouponKey, couponCodeRef.current);
        } else {
          localStorage.removeItem(prevCouponKey);
        }
      }

      // Remove any shared global keys
      localStorage.removeItem('shoply_cart');
      localStorage.removeItem('velora_cart');
      localStorage.removeItem('shoply_coupon');
      localStorage.removeItem('velora_coupon');

      if (!currentUserId) {
        // === LOGOUT EVENT ===
        // When a user logs out, immediately wipe in-memory cart and coupon so next user never sees it
        setCartItems([]);
        setCouponCode('');
        setDiscountPercent(0);
        setDiscountFlat(0);
        // Also clear guest storage so logged-out cart items never bleed into guest
        localStorage.removeItem('shoply_cart_guest');
        localStorage.removeItem('shoply_coupon_guest');
      } else {
        // === LOGIN OR SWITCH USER EVENT ===
        // Load the new user's isolated cart from their dedicated key
        const newCartKey = getCartKey(user);
        const newCouponKey = getCouponKey(user);

        let userSavedCart = [];
        try {
          const raw = localStorage.getItem(newCartKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) userSavedCart = parsed;
          }
        } catch {
          userSavedCart = [];
        }

        // If transitioning from guest (fresh session before logging in), merge guest items if any
        if (!prevUserId) {
          try {
            const rawGuest = localStorage.getItem('shoply_cart_guest');
            if (rawGuest) {
              const guestCart = JSON.parse(rawGuest);
              if (Array.isArray(guestCart) && guestCart.length > 0) {
                const merged = [...userSavedCart];
                for (const gItem of guestCart) {
                  const idx = merged.findIndex(
                    (u) => u.product === gItem.product && (u.sellerName === gItem.sellerName || !u.sellerName)
                  );
                  if (idx > -1) {
                    merged[idx] = {
                      ...merged[idx],
                      qty: Math.min(merged[idx].stock || 99, merged[idx].qty + gItem.qty),
                    };
                  } else {
                    merged.push(gItem);
                  }
                }
                userSavedCart = merged;
                localStorage.removeItem('shoply_cart_guest');
                localStorage.removeItem('shoply_coupon_guest');
              }
            }
          } catch {}
        }

        setCartItems(userSavedCart);

        // Load new user's coupon
        const savedCoupon = localStorage.getItem(newCouponKey) || '';
        setCouponCode(savedCoupon);
        if (savedCoupon === 'SHOPLY10' || savedCoupon === 'VELORA10') setDiscountPercent(10);
        else if (savedCoupon === 'VIP20' || savedCoupon === 'MEGASALE') setDiscountPercent(20);
        else setDiscountPercent(0);
        setDiscountFlat(0);
      }

      // Update tracking refs
      prevUserIdRef.current = currentUserId;
      prevUserRef.current = user;
    }
  }, [currentUserId, user]);

  // Persist cartItems to the active user's dedicated key whenever cartItems change
  useEffect(() => {
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  // Persist couponCode to the active user's dedicated key whenever couponCode changes
  useEffect(() => {
    const key = getCouponKey(user);
    if (couponCode) {
      localStorage.setItem(key, couponCode);
    } else {
      localStorage.removeItem(key);
    }
  }, [couponCode, user]);

  const addToCart = (product, qty = 1, selectedOffer = null) => {
    const fallbackPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const offerPrice = selectedOffer?.price ?? fallbackPrice;
    const sellerName =
      selectedOffer?.sellerName ||
      product.seller?.shopName ||
      product.seller?.name ||
      'Shoply Official Direct';
    const sellerId = selectedOffer?.sellerId || product.seller?._id || product.seller;
    const deliveryText = selectedOffer?.deliveryText || 'Fast Insured Delivery';

    const itemImage =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : typeof product.images === 'string'
        ? product.images
        : '';

    setCartItems((prev) => {
      const existItem = prev.find(
        (x) => x.product === product._id && (x.sellerName === sellerName || !x.sellerName)
      );
      if (existItem) {
        return prev.map((x) =>
          x.product === product._id && (x.sellerName === sellerName || !x.sellerName)
            ? { ...x, qty: Math.min(product.stock, x.qty + qty), price: offerPrice, sellerName, deliveryText }
            : x
        );
      } else {
        return [
          ...prev,
          {
            product: product._id,
            title: product.title,
            image: itemImage,
            price: offerPrice,
            originalPrice: product.price,
            stock: product.stock,
            brand: product.brand,
            category: product.category,
            seller: sellerId,
            sellerName: sellerName,
            deliveryText: deliveryText,
            qty: Math.min(product.stock, qty),
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((x) => x.product !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((x) =>
        x.product === productId ? { ...x, qty: Math.min(x.stock, qty) } : x
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountPercent(0);
    setDiscountFlat(0);
    const key = getCartKey(user);
    const couponKey = getCouponKey(user);
    localStorage.removeItem(key);
    localStorage.removeItem(couponKey);
    localStorage.removeItem('shoply_cart_guest');
    localStorage.removeItem('shoply_coupon_guest');
    localStorage.removeItem('shoply_cart');
    localStorage.removeItem('shoply_coupon');
    localStorage.removeItem('velora_cart');
    localStorage.removeItem('velora_coupon');
  };

  const applyCoupon = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a promo code.' };

    try {
      const { data } = await api.post('/coupons/validate', {
        code: cleanCode,
        orderAmount: itemsPrice,
      });

      if (data.valid) {
        setCouponCode(data.code);
        setMaxDiscountAmount(data.maxDiscountAmount || 0);
        if (data.discountType === 'percentage') {
          setDiscountPercent(data.discountValue);
          setDiscountFlat(0);
        } else {
          setDiscountPercent(0);
          setDiscountFlat(data.discountValue);
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Invalid coupon code' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or unrecognized promo code.',
      };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setDiscountFlat(0);
    setMaxDiscountAmount(0);
  };

  // Price computations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const calculatedPercentDiscount = Math.round(((itemsPrice * discountPercent) / 100) * 100) / 100;
  const effectivePercentDiscount =
    maxDiscountAmount > 0 ? Math.min(calculatedPercentDiscount, maxDiscountAmount) : calculatedPercentDiscount;
  const discountAmount = Math.min(itemsPrice, Math.max(effectivePercentDiscount, discountFlat));
  const shippingPrice = itemsPrice > 1999 || itemsPrice === 0 ? 0 : 199;
  const taxableAmount = Math.max(0, itemsPrice - discountAmount);
  const taxPrice = Math.round(taxableAmount * 0.18 * 100) / 100;
  const totalPrice = Math.round((taxableAmount + shippingPrice + taxPrice) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        couponCode,
        discountPercent,
        discountFlat,
        applyCoupon,
        removeCoupon,
        itemsPrice,
        discountAmount,
        shippingPrice,
        taxPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
