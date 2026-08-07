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

/** The URL that should be opened for this device. */
export function whatsappUrl(
  message: string,
  number: string = BRAND.whatsappNumber,
  mobile = isMobileDevice(),
): string {
  const text = encodeURIComponent(message);
  return mobile
    ? `https://wa.me/${number}?text=${text}`
    : `https://web.whatsapp.com/send?phone=${number}&text=${text}`;
}

export function openWhatsApp(message: string, number: string = BRAND.whatsappNumber) {
  const url = whatsappUrl(message, number);
  if (isMobileDevice()) {
    window.location.href = url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
