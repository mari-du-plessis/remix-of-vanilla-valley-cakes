import { BRAND } from "@/config/brand";

/**
 * Canonical public hand-off. WhatsApp chooses Web, Desktop or the mobile app.
 * Use only when the site is a top-level page: WhatsApp refuses to render in a
 * sandboxed editor popup.
 */
export function whatsappUrl(
  message: string,
  number: string = BRAND.whatsappNumber,
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Installed-app hand-off for sandboxed previews. It avoids loading WhatsApp's
 * frame-protected web document inside a popup inherited from the editor.
 */
export function whatsappAppUrl(
  message: string,
  number: string = BRAND.whatsappNumber,
): string {
  return `whatsapp://send?phone=${number}&text=${encodeURIComponent(message)}`;
}
