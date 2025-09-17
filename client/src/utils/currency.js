/**
 * Formats a number as DZD (Algerian Dinar) currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "DZD 1,234.56")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'DZD 0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'DZD',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('DZD', 'DZD ').trim();
};

/**
 * Formats a price with unit (for per km pricing)
 * @param {number} price - The price per unit
 * @returns {string} Formatted price string (e.g., "DZD 250.00/km")
 */
export const formatPriceWithUnit = (price) => {
  if (price === null || price === undefined) return 'DZD 0.00';
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
  
  return `DZD ${formatted}/km`;
};
