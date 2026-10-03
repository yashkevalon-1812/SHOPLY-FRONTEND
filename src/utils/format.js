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
