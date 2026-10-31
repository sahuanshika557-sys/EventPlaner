/**
 * Floating-point safe addition for currency amounts.
 * Prevents IEEE-754 issues such as 0.1 + 0.2 = 0.30000000000000004
 */
export function addCurrency(a: number, b: number): number {
  const centsA = Math.round((a || 0) * 100);
  const centsB = Math.round((b || 0) * 100);
  return (centsA + centsB) / 100;
}

/**
 * Floating-point safe subtraction
 */
export function subtractCurrency(a: number, b: number): number {
  const centsA = Math.round((a || 0) * 100);
  const centsB = Math.round((b || 0) * 100);
  return (centsA - centsB) / 100;
}

/**
 * Floating-point safe multiplication
 */
export function multiplyCurrency(amount: number, factor: number): number {
  return Math.round((amount || 0) * factor * 100) / 100;
}

/**
 * Rounds a number to exactly 2 decimal places safely
 */
export function roundCurrency(num: number): number {
  return Math.round((num || 0) * 100) / 100;
}

/**
 * Formats a monetary amount into a localized string with symbol
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const safeAmount = roundCurrency(amount);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    // Fallback if currency code is custom or not supported
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      CAD: 'CA$',
      AUD: 'AU$',
    };
    const symbol = symbolMap[currency] || '$';
    return `${symbol}${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
