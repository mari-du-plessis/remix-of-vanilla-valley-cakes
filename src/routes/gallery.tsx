import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Photo = {
  id: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
};

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Cake Gallery — Vanilla Valley Bakery" },
      { name: "description", content: "Browse our recent custom cake creations — birthdays, weddings, baby showers and more." },
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

  useEffect(() => {
    supabase
      .from("gallery_photos")
      .select("id,image_path,caption,sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setPhotos(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 pt-6 pb-4 text-center">
        <Link to="/" className="text-sm text-muted-foreground">← Home</Link>
        <h1 className="mt-3 text-3xl font-semibold text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
          Our Gallery
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">A few of our recent creations</p>
      </header>

      <main className="px-4 pb-12">
        {photos === null ? (
          <p className="text-center text-sm text-muted-foreground mt-12">Loading…</p>
        ) : photos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-12">No photos yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto">
            {photos.map((p) => (
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
