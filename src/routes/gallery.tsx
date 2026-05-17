import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OCCASIONS } from "@/lib/order-config";

type Photo = {
  id: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
  category: string | null;
};

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Cake Gallery — Vanilla Valley Bakery" },
      { name: "description", content: "Browse our recent custom cake creations — princess cakes, weddings, baby showers and more." },
      { property: "og:title", content: "Cake Gallery — Vanilla Valley Bakery" },
      { property: "og:description", content: "Browse our recent custom cake creations." },
    ],
  }),
  component: GalleryPage,
});

function publicUrl(path: string) {
  return supabase.storage.from("gallery-photos").getPublicUrl(path).data.publicUrl;
}

function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [active, setActive] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("gallery_photos")
      .select("id,image_path,caption,sort_order,category")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setPhotos(data ?? []));
  }, []);

  const tabs = useMemo(() => ["All", ...OCCASIONS], []);

  const filtered = useMemo(() => {
    if (!photos) return null;
    if (active === "All") return photos;
    return photos.filter((p) => p.category === active);
  }, [photos, active]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 text-center">
        <Link to="/" className="text-sm text-muted-foreground">← Home</Link>
        <h1 className="mt-3 text-3xl font-semibold text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
          Our Gallery
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">A few of our recent creations</p>
      </header>

      <div className="px-4 mb-4 overflow-x-auto">
        <div className="flex gap-2 max-w-4xl mx-auto w-max">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border transition-colors " +
                (active === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pb-12">
        {filtered === null ? (
          <p className="text-center text-sm text-muted-foreground mt-12">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-12">
            {active === "All" ? "No photos yet — check back soon!" : `No photos in "${active}" yet.`}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto">
            {filtered.map((p) => (
              <figure key={p.id} className="overflow-hidden rounded-lg bg-muted">
                <img
                  src={publicUrl(p.image_path)}
                  alt={p.caption ?? "Cake photo"}
                  loading="lazy"
                  className="w-full h-auto object-cover aspect-square"
                />
                {p.caption && (
                  <figcaption className="px-2 py-1.5 text-xs text-muted-foreground">{p.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
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
