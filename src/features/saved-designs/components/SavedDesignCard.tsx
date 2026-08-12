import { Link } from "@tanstack/react-router";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { CakeBuilderPreview } from "@/features/cake-builder/components/CakeBuilderPreview";
import { usesCakeRenderer } from "@/config/product-builders";
import { describeSnapshot, snapshotToForm } from "../lib/snapshot";
import type { SavedDesign } from "../types";

/**
 * A saved design card. The illustration is re-rendered live from the stored
 * configuration through the shared renderer — never from a cached image — so
 * old designs always benefit from the current artwork.
 */
export function SavedDesignCard({
  design,
  catalog,
  onDelete,
}: {
  design: SavedDesign;
  catalog: CakeCatalog;
  onDelete: (id: string) => void;
}) {
  const form = snapshotToForm(design.design, {
    aiPreviewUrl: design.aiPreviewUrl,
    aiPreviewSignature: design.aiPreviewSignature,
  });
  const rendersCake = usesCakeRenderer(form.product);

  return (
    <article className="surface-card overflow-hidden rounded-3xl border border-border/60">
      <div className="flex items-end justify-center bg-[radial-gradient(120%_90%_at_50%_10%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_70%)] px-4 pt-4">
        {rendersCake ? (
          <CakeBuilderPreview form={form} catalog={catalog} className="h-44 w-full" />
        ) : design.aiPreviewUrl ? (
          <img
            src={design.aiPreviewUrl}
            alt={`${design.name} concept illustration`}
            loading="lazy"
            className="h-44 w-full object-contain"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center text-sm text-muted-foreground">
            No preview yet
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-lg">{design.name}</h2>
          <p className="text-xs text-muted-foreground">{describeSnapshot(design.design)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-10 flex-1 rounded-full">
            <Link to="/order" search={{ design: design.id }}>
              <MessageCircle className="mr-2 h-4 w-4" /> Order this cake
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full">
            <Link to="/order" search={{ design: design.id, edit: true }}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="h-10 rounded-full text-muted-foreground"
            aria-label={`Delete ${design.name}`}
            onClick={() => onDelete(design.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
