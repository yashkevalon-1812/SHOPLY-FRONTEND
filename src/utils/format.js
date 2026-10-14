/**
 * Utility functions for Indian Currency (INR) formatting
 */

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Returns separated rupees, paise, and full string for responsive KPI display
 */
export const formatINRPair = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return { rupees: '₹0', paise: '', full: '₹0' };
  }
  const num = Number(amount);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const [rupees, paise] = formatted.split('.');
  return {
    rupees: '₹' + rupees,
    paise: paise ? '.' + paise : '',
    full: '₹' + formatted,
  };
};

