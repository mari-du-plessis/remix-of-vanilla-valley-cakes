/** Money helpers. Prices are stored in cents and are internal-only. */

export const CURRENCY_SYMBOL: Record<string, string> = { ZAR: "R", USD: "$", EUR: "€" };

export function formatCents(cents: number, currency = "ZAR") {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const amount = (Math.abs(cents) / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? "-" : ""}${symbol}${amount}`;
}

/** "1250.50" -> 125050. Tolerant of spaces, commas and currency symbols. */
export function parseAmountToCents(input: string) {
  const cleaned = input.replace(/[^\d.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** 125050 -> "1250.50", for editing in a number input. */
export const centsToAmount = (cents: number) => (cents / 100).toFixed(2);

export const formatPercent = (value: number) => `${value}%`;
