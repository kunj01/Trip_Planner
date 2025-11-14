// Currency conversion utility
// 1 USD = 83 INR (approximate conversion rate)
const USD_TO_INR_RATE = 83;

/**
 * Convert USD amount to Indian Rupees
 * @param {number|string} usdAmount - Amount in USD (can be number or string like "$1,500")
 * @returns {number} - Amount in INR
 */
export const convertUSDToINR = (usdAmount) => {
  if (typeof usdAmount === 'string') {
    // Remove $ and commas, then parse
    const numericValue = parseFloat(usdAmount.replace(/[$,]/g, ''));
    if (isNaN(numericValue)) return 0;
    return Math.round(numericValue * USD_TO_INR_RATE);
  }
  if (typeof usdAmount === 'number') {
    return Math.round(usdAmount * USD_TO_INR_RATE);
  }
  return 0;
};

/**
 * Format amount as Indian Rupees
 * @param {number} amount - Amount in INR
 * @returns {string} - Formatted string like "₹1,24,500"
 */
export const formatINR = (amount) => {
  if (typeof amount === 'string') {
    // If it's already a formatted string with $, convert it
    const numericValue = parseFloat(amount.replace(/[$,]/g, ''));
    if (isNaN(numericValue)) return amount;
    amount = convertUSDToINR(numericValue);
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }

  // Format with Indian numbering system (lakhs, crores)
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Convert and format USD to INR
 * @param {number|string} usdAmount - Amount in USD
 * @returns {string} - Formatted INR string
 */
export const convertAndFormatToINR = (usdAmount) => {
  const inrAmount = convertUSDToINR(usdAmount);
  return formatINR(inrAmount);
};

export default {
  convertUSDToINR,
  formatINR,
  convertAndFormatToINR,
};

