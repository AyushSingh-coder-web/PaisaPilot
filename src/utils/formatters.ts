/**
 * PaisaPilot Currency & Number Formatting Helpers
 * Strictly handles Indian Rupee (INR) formatting.
 */

export function formatINR(amount: number | undefined | null, includeSymbol = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return includeSymbol ? `₹${formatted}` : formatted;
}

export function formatCompactINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

export function sanitizeAmount(input: string | number, min = 0, max = Infinity): number {
  const parsed = typeof input === 'number' ? input : parseFloat(String(input).replace(/[^0-9.-]+/g, ''));
  if (isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
