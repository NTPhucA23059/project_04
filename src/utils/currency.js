/**
 * Format currency to USD ($) - full format without k/M abbreviations
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string (e.g., "$650,000")
 */
export const formatUSD = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$0";
  }

  const num = Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format currency to USD - same as formatUSD (for consistency)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatUSDShort = (amount) => {
  return formatUSD(amount);
};

