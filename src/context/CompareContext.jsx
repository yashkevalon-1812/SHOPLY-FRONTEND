import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const { addToast } = useToast();
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shoply_compare') || localStorage.getItem('velora_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('shoply_compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  const addToCompare = (product) => {
    if (!product || !product._id) return;

    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
      return;
    }

    if (compareItems.length >= 4) {
      addToast('Compare limit reached (maximum 4 items). Remove one to add another.', 'info');
      return;
    }

    setCompareItems((prev) => [...prev, product]);
    addToast(`Added "${product.title}" to compare list`, 'success');
  };

  const removeFromCompare = (productId) => {
    const removed = compareItems.find((item) => item._id === productId);
    setCompareItems((prev) => prev.filter((item) => item._id !== productId));
    if (removed) {
      addToast(`Removed "${removed.title}" from compare`, 'info');
    }
  };

  const clearCompare = () => {
    setCompareItems([]);
    localStorage.removeItem('shoply_compare');
    addToast('Compare list cleared', 'info');
  };

  const openCompare = () => setIsCompareOpen(true);
  const closeCompare = () => setIsCompareOpen(false);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        compareCount: compareItems.length,
        isInCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        openCompare,
        closeCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
