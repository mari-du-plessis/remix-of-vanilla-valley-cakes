import { BRAND } from "@/config/brand";

/**
 * Canonical public hand-off. WhatsApp decides for itself whether to continue
 * into WhatsApp Desktop, WhatsApp Web or the installed mobile app, so one URL
 * serves every platform.
 */
export function whatsappUrl(
  message: string,
  number: string = BRAND.whatsappNumber,
): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp immediately as part of the submission.
 *
 * Returns `false` only when the browser genuinely refused to open the tab
 * (pop-up blockers, sandboxed embeds) — the caller then shows a fallback.
 */
export function openWhatsApp(message: string): boolean {
  const url = whatsappUrl(message);
  try {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) return true;
  } catch {
    /* fall through to the anchor attempt */
  }

  try {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    return false;
  }
}
