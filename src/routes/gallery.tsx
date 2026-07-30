import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState, LoadingState } from "@/components/common";
import { GALLERY_ALL_TAB, GALLERY_CATEGORIES } from "@/config/occasions";
import { CategoryTabs } from "@/features/gallery/components/CategoryTabs";
import { GalleryGrid } from "@/features/gallery/components/GalleryGrid";
import { useGalleryPhotos } from "@/features/gallery/hooks/useGalleryPhotos";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Cake Gallery — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Browse our recent custom cake creations — princess cakes, weddings, baby showers and more.",
      },
      { property: "og:title", content: "Cake Gallery — Vanilla Valley Bakery" },
      { property: "og:description", content: "Browse our recent custom cake creations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: photos, isLoading } = useGalleryPhotos();
  const [active, setActive] = useState<string>(GALLERY_ALL_TAB);

  const tabs = useMemo(() => [GALLERY_ALL_TAB, ...GALLERY_CATEGORIES], []);

  const filtered = useMemo(() => {
    if (!photos) return null;
    if (active === GALLERY_ALL_TAB) return photos;
    return photos.filter((p) => p.category === active);
  }, [photos, active]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 text-center">
        <Link to="/" className="text-sm text-muted-foreground">
          ← Home
        </Link>
        <h1
          className="mt-3 text-3xl font-semibold text-foreground"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Our Gallery
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">A few of our recent creations</p>
      </header>

      <CategoryTabs tabs={tabs} active={active} onChange={setActive} />

      <main className="px-4 pb-12">
        {isLoading || filtered === null ? (
          <LoadingState className="mt-12" />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-12"
            message={
              active === GALLERY_ALL_TAB
                ? "No photos yet — check back soon!"
                : `No photos in "${active}" yet.`
            }
          />
        ) : (
          <GalleryGrid photos={filtered} />
        )}

        <div className="mt-10 text-center">
          <Link
            to="/order"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Order your cake
          </Link>
        </div>
      </main>
    </div>
  );
}
