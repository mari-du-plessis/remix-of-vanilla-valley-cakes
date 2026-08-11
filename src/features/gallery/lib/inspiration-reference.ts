/**
 * Gallery → Cake Builder inspiration hand-off.
 *
 * A customer can pick one of Vanilla Valley's own gallery photos as a visual
 * reference for their commission. That choice has to survive a route change
 * (/gallery → /order), so it is parked in sessionStorage rather than in a new
 * global store — the order wizard reads it once when it mounts.
 *
 * The reference is deliberately kept distinct from `inspirationFile`, the
 * customer's own upload. Future Saved Designs / inspiration boards need to
 * know whose image it was.
 */

export type GalleryInspiration = {
  /** gallery_photos.id — lets future features (favourites, boards) link back. */
  id: string;
  /** Storage object path, so a later feature can re-resolve or re-size it. */
  imagePath: string;
  /** Public URL used for display and for the WhatsApp enquiry. */
  url: string;
  caption: string | null;
  category: string | null;
  /** Always "gallery" today; keeps room for other curated sources later. */
  source: "gallery";
};

const STORAGE_KEY = "vv.gallery-inspiration";

export function storeGalleryInspiration(reference: GalleryInspiration) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reference));
  } catch {
    /* private mode / quota — the reference is simply not carried over */
  }
}

export function readGalleryInspiration(): GalleryInspiration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GalleryInspiration;
    return parsed && typeof parsed.url === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearGalleryInspiration() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
