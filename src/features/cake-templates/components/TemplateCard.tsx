import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { CakeBuilderPreview } from "@/features/cake-builder/components/CakeBuilderPreview";
import { describeSnapshot, snapshotToForm } from "@/features/saved-designs/lib/snapshot";
import type { CakeTemplate } from "../types";

/**
 * A curated starting design.
 *
 * The illustration is re-rendered live from the template's structured
 * configuration through the shared cake renderer — never a screenshot — so
 * every improvement to the asset library improves every template at once.
 */
export function TemplateCard({
  template,
  catalog,
}: {
  template: CakeTemplate;
  catalog: CakeCatalog;
}) {
  const form = snapshotToForm(template.design);

  return (
    <article className="surface-card lift-on-hover overflow-hidden rounded-3xl border border-border/60">
      <Link
        to="/cake-templates/$slug"
        params={{ slug: template.slug }}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View the ${template.name} cake template`}
      >
        <div className="relative flex items-end justify-center bg-[radial-gradient(120%_90%_at_50%_10%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_70%)] px-4 pt-4">
          <CakeBuilderPreview form={form} catalog={catalog} className="h-48 w-full" />
          {template.isFeatured && (
            <span className="eyebrow absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[0.55rem] text-primary">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
        </div>

        <div className="space-y-2 p-5">
          {template.category && (
            <p className="eyebrow text-[0.55rem] text-primary">{template.category}</p>
          )}
          <h2 className="text-lg leading-tight">{template.name}</h2>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {template.description?.trim() || describeSnapshot(template.design)}
          </p>
          <p className="eyebrow pt-1 text-[0.55rem] text-foreground/70">
            A starting design you can customise
          </p>
        </div>
      </Link>
    </article>
  );
}
