import { BUCKETS, bucketPublicUrl } from "@/lib/supabase/storage";
import type { GalleryPhoto } from "../types";

export function galleryPhotoUrl(path: string) {
  return bucketPublicUrl(BUCKETS.gallery, path);
}

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto">
      {photos.map((p) => (
        <figure key={p.id} className="overflow-hidden rounded-lg bg-muted">
          <img
            src={galleryPhotoUrl(p.image_path)}
            alt={p.caption ?? "Cake photo"}
            loading="lazy"
            className="w-full h-auto object-cover aspect-square"
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
