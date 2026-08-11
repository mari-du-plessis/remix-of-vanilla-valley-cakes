import { BUCKETS, bucketPublicUrl } from "@/lib/supabase/storage";
import type { GalleryPhoto } from "../types";

export function galleryPhotoUrl(path: string) {
  return bucketPublicUrl(BUCKETS.gallery, path);
}

/**
 * Editorial masonry gallery.
 *
 * CSS columns keep every photo at its natural aspect ratio — tall cakes are
 * never cropped — while staying a single, cheap layout on mobile. Each tile is
 * a real button so the lightbox is reachable by keyboard.
 */
export function GalleryGrid({
  photos,
  onOpen,
}: {
  photos: GalleryPhoto[];
  onOpen?: (index: number) => void;
}) {
  return (
    <ul className="mx-auto max-w-5xl columns-2 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
      {photos.map((p, i) => (
        <li key={p.id} className="mb-4 break-inside-avoid">
          <button
            type="button"
            onClick={() => onOpen?.(i)}
            aria-label={
              p.caption ? `View ${p.caption}` : `View gallery image ${i + 1} of ${photos.length}`
            }
            className="lift-on-hover group block w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img
              src={galleryPhotoUrl(p.image_path)}
              alt={p.caption ?? "Vanilla Valley cake"}
              /* First screenful loads eagerly; everything else on demand. */
              loading={i < 4 ? "eager" : "lazy"}
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 30vw"
              className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {(p.caption || p.category) && (
              <div className="px-3 py-2.5">
                {p.category && (
                  <p className="eyebrow text-[0.55rem] text-primary">{p.category}</p>
                )}
                {p.caption && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.caption}</p>
                )}
              </div>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
