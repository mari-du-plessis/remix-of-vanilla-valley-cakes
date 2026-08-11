import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmptyState, LoadingState } from "@/components/common";
import { Eyebrow, Lead } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import { GALLERY_ALL_TAB, GALLERY_CATEGORIES } from "@/config/occasions";
import { CategoryTabs } from "@/features/gallery/components/CategoryTabs";
import { GalleryGrid } from "@/features/gallery/components/GalleryGrid";
import { useGalleryPhotos } from "@/features/gallery/hooks/useGalleryPhotos";
import { SiteShell } from "@/features/site/components/SiteShell";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Cake Gallery — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Browse our recent bespoke cake creations — weddings, celebrations, baby showers and corporate commissions.",
      },
      { property: "og:title", content: "Cake Gallery — Vanilla Valley Bakery" },
      { property: "og:description", content: "Browse our recent bespoke cake creations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: photos, isLoading } = useGalleryPhotos();
  const [active, setActive] = useState<string>(GALLERY_ALL_TAB);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tabs = useMemo(() => [GALLERY_ALL_TAB, ...GALLERY_CATEGORIES], []);

  const filtered = useMemo(() => {
    if (!photos) return null;
    if (active === GALLERY_ALL_TAB) return photos;
    return photos.filter((p) => p.category === active);
  }, [photos, active]);

  const changeCategory = (tab: string) => {
    setActive(tab);
    setLightboxIndex(null);
  };

  return (
    <SiteShell>
      <header className="px-6 pt-14 pb-10 text-center">
        <Eyebrow className="text-primary">The portfolio</Eyebrow>
        <h1 className="mt-4">Our gallery</h1>
        <div className="gold-rule mx-auto mt-6 max-w-[8rem]" />
        <Lead className="mx-auto mt-6 max-w-md">
          A selection of recent commissions, each one designed from scratch. Tap any cake to
          view it larger — or to use it as inspiration for your own.
        </Lead>
      </header>

      <CategoryTabs tabs={tabs} active={active} onChange={changeCategory} />

      <div className="px-4 pb-4">
        {isLoading || filtered === null ? (
          <LoadingState className="mt-12" />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="mt-12"
            message={
              active === GALLERY_ALL_TAB
                ? "No photos yet — check back soon."
                : `No photos in "${active}" yet.`
            }
            action={
              active !== GALLERY_ALL_TAB ? (
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6 text-xs tracking-[0.16em] uppercase"
                  onClick={() => changeCategory(GALLERY_ALL_TAB)}
                >
                  View all cakes
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <GalleryGrid photos={filtered} onOpen={setLightboxIndex} />
            <GalleryLightbox
              photos={filtered}
              index={lightboxIndex}
              onIndexChange={setLightboxIndex}
              onClose={() => setLightboxIndex(null)}
            />
          </>
        )}


        <div className="mt-14 text-center">
          <Link to="/order">
            <Button
              size="lg"
              className="h-13 rounded-full px-10 text-sm tracking-[0.18em] uppercase"
            >
              Design your cake
            </Button>
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
