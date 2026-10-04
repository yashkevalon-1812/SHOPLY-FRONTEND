import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { addToast } = useToast();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved =
        localStorage.getItem('shoply_wishlist') ||
        localStorage.getItem('velora_wishlist') ||
        localStorage.getItem('shopsphere_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize items to ensure valid entries
          return parsed.filter((item) => item && (item._id || item.id));
        }
      }
      return [];
    } catch (e) {
      console.error('Error loading wishlist from storage:', e);
      return [];
    }
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shoply_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Error saving wishlist to storage:', e);
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    const targetId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
    return wishlistItems.some((item) => (item._id || item.id) === targetId);
  };

  const addToWishlist = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    if (!prodId) return;

    if (isInWishlist(prodId)) {
      removeFromWishlist(prodId);
      return;
    }

    setWishlistItems((prev) => [product, ...prev]);
    addToast(`Added "${product.title || 'Product'}" to your wishlist`, 'success');
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    const targetId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
    const removed = wishlistItems.find((item) => (item._id || item.id) === targetId);
    setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== targetId));
    if (removed) {
      addToast(`Removed "${removed.title || 'Product'}" from wishlist`, 'info');
    }
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    if (!prodId) return;

    if (isInWishlist(prodId)) {
      removeFromWishlist(prodId);
    } else {
      setWishlistItems((prev) => [
        product,
        ...prev.filter((item) => (item._id || item.id) !== prodId),
      ]);
      addToast(`Added "${product.title || 'Product'}" to your wishlist`, 'success');
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    try {
      localStorage.removeItem('shoply_wishlist');
      localStorage.removeItem('velora_wishlist');
      localStorage.removeItem('shopsphere_wishlist');
    } catch {}
    addToast('Wishlist cleared', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
