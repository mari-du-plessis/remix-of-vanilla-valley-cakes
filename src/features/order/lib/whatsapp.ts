import { BRAND } from "@/config/brand";

/**
 * Platform-aware WhatsApp hand-off.
 *
 * Mobile devices get the standard `wa.me` link, which the operating system
 * hands straight to the installed WhatsApp app. Desktops open WhatsApp Web in
 * a new tab, which in turn hands over to WhatsApp Desktop when it is installed.
 * The message is pre-filled in both cases — the customer only presses Send.
 *
 * No iframes, no dialogs, no embedded browsers: only the URLs WhatsApp
 * publishes for sharing.
 */

const MOBILE_RE = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile Safari/i;

export const isMobileDevice = () =>
  typeof navigator !== "undefined" && MOBILE_RE.test(navigator.userAgent);

/**
 * `wa.me` is used on every platform: it is the only WhatsApp URL that is safe
 * to open from an embedded/preview context. It redirects to the app on mobile
 * and to WhatsApp Web/Desktop on computers. Linking straight to
 * `web.whatsapp.com` is refused by the browser (ERR_BLOCKED_BY_RESPONSE).
 */
export function whatsappUrl(
  message: string,
  number: string = BRAND.whatsappNumber,
  _mobile = isMobileDevice(),
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string, number: string = BRAND.whatsappNumber) {
  const url = whatsappUrl(message, number);
  if (isMobileDevice()) {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
