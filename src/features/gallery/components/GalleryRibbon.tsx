import { Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/common/Typography";
import { useFeaturedGalleryPhotos } from "../hooks/useGalleryPhotos";
import { galleryPhotoUrl } from "./GalleryGrid";

/**
 * Homepage "recent creations" ribbon.
 *
 * Curated from the same database-backed gallery Sonja manages in the admin
 * panel — the first N photos in her chosen sort order — so there is only one
 * source of truth for gallery content. Renders nothing until photos exist.
 */
export function GalleryRibbon({ limit = 12 }: { limit?: number }) {
  const { data: photos = [] } = useFeaturedGalleryPhotos(limit);
  if (photos.length === 0) return null;

  const loop = [...photos, ...photos];

  return (
    <section className="overflow-hidden py-16">
      <div className="px-6 text-center">
        <Eyebrow className="text-primary">The portfolio</Eyebrow>
        <h2 className="mt-4">Recent creations</h2>
        <div className="gold-rule mx-auto mt-6 max-w-[8rem]" />
      </div>
      <div className="relative mt-10 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-5">
          {loop.map((photo, i) => (
            <figure
              key={`${photo.id}-${i}`}
              className="h-64 w-64 shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-[var(--shadow-soft)] sm:h-72 sm:w-72"
            >
              <img
                src={galleryPhotoUrl(photo.image_path)}
                alt={photo.caption ?? "Vanilla Valley cake"}
                loading="lazy"
                decoding="async"
                aria-hidden={i >= photos.length}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/gallery"
          className="eyebrow text-[0.65rem] text-muted-foreground transition-colors hover:text-primary"
        >
          See the full gallery →
        </Link>
      </div>
    </section>
  );
}
