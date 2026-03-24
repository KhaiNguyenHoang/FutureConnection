/**
 * Formats a number to a compact string representation.
 * Example: 1500 -> 1.5K, 10000 -> 10K, 1000000 -> 1M
 */
export function formatCompactNumber(number: number): string {
  if (number === undefined || number === null) return "0";
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(number);
}
