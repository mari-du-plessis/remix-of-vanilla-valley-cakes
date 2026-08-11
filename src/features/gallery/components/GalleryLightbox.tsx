import { useCallback, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { galleryPhotoUrl } from "./GalleryGrid";
import { storeGalleryInspiration } from "../lib/inspiration-reference";
import type { GalleryPhoto } from "../types";

/**
 * Full-screen image viewer for the public gallery.
 *
 * Uses the design-system Dialog (Radix) so focus trapping, Escape handling and
 * scroll locking come for free; arrow-key navigation is added on top. The
 * "Use as inspiration" action only parks a reference — the customer still has
 * to start (or continue) their own commission.
 */
export function GalleryLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && index >= 0 && index < photos.length;
  const photo = open ? photos[index] : null;

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const useAsInspiration = () => {
    if (!photo) return;
    storeGalleryInspiration({
      id: photo.id,
      imagePath: photo.image_path,
      url: galleryPhotoUrl(photo.image_path),
      caption: photo.caption,
      category: photo.category,
      source: "gallery",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border-border/70 p-0">
        {photo && (
          <>
            <DialogTitle className="sr-only">
              {photo.caption || "Vanilla Valley cake"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Image {(index ?? 0) + 1} of {photos.length}. Use the arrow buttons or arrow keys
              to move between images.
            </DialogDescription>

            <div className="relative bg-black/40">
              <img
                key={photo.id}
                src={galleryPhotoUrl(photo.image_path)}
                alt={photo.caption ?? "Vanilla Valley cake"}
                className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="absolute top-1/2 left-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                {photo.category && (
                  <p className="eyebrow text-primary">{photo.category}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">
                  {photo.caption || "A bespoke Vanilla Valley commission."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {(index ?? 0) + 1} of {photos.length}
                </p>
              </div>
              <Link to="/order" onClick={useAsInspiration} className="shrink-0">
                <Button className="h-11 w-full rounded-full px-6 text-xs tracking-[0.16em] uppercase sm:w-auto">
                  <Sparkles className="mr-2 h-4 w-4" /> Use as inspiration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
