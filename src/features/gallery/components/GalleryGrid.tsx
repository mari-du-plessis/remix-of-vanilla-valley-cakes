import { BUCKETS, bucketPublicUrl } from "@/lib/supabase/storage";
import type { GalleryPhoto } from "../types";

export function galleryPhotoUrl(path: string) {
  return bucketPublicUrl(BUCKETS.gallery, path);
}

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">
      {photos.map((p) => (
        <figure
          key={p.id}
          className="lift-on-hover overflow-hidden rounded-2xl border border-border/60 bg-card"
        >
          <img
            src={galleryPhotoUrl(p.image_path)}
            alt={p.caption ?? "Cake photo"}
            loading="lazy"
            className="aspect-square h-auto w-full object-cover"
          />
          {p.caption && (
            <figcaption className="px-2 py-1.5 text-xs text-muted-foreground">
              {p.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
