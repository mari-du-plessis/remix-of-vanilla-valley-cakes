/**
 * Brand-level configuration.
 * Single source of truth for bakery identity and contact channels.
 */

export const BRAND = {
  name: "Vanilla Valley",
  legalName: "Vanilla Valley Bakery",
  tagline: "Artisan Bakery · South Africa",
  country: "South Africa",
  /** International format, no leading + — used to build wa.me links. */
  whatsappNumber: "27784210783",
  replyWindow: "24 hours",
} as const;

/** Backwards-compatible aliases (still imported in a few places). */
export const BAKERY_NAME = BRAND.name;
export const WHATSAPP_NUMBER = BRAND.whatsappNumber;

export const buildWhatsAppLink = (message: string, number: string = BRAND.whatsappNumber) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
