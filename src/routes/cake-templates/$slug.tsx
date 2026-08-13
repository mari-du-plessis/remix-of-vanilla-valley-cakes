import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/common";
import { Eyebrow } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { sizeLabel } from "@/features/catalog/lib/cake-catalog";
import { CakeStage } from "@/features/cake-builder/components/CakeStage";
import { snapshotToForm } from "@/features/saved-designs/lib/snapshot";
import { useCakeTemplate } from "@/features/cake-templates/hooks/useCakeTemplates";
import { templateSummaryLines } from "@/features/cake-templates/lib/summary";

export const Route = createFileRoute("/cake-templates/$slug")({
  head: () => ({
    meta: [
      { title: "Cake Template — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "View one of Vanilla Valley's curated cake designs and customise it into your own bespoke cake.",
      },
      { property: "og:title", content: "Cake Template — Vanilla Valley Bakery" },
      {
        property: "og:description",
        content: "A curated Vanilla Valley cake design you can make your own.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TemplateDetailPage,
});

function TemplateDetailPage() {
  const { slug } = Route.useParams();
  const { catalog } = useCakeCatalog();
  const { data: template, isPending } = useCakeTemplate(slug);

  if (isPending) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <LoadingState label="Loading this design…" />
        </div>
      </SiteShell>
    );
  }

  if (!template) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <EmptyState
            message="This design is no longer available."
            action={
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/cake-templates">Browse templates</Link>
              </Button>
            }
          />
        </div>
      </SiteShell>
    );
  }

  const form = snapshotToForm(template.design);
  const lines = templateSummaryLines(
    template.design,
    template.design.size ? sizeLabel(catalog, template.design.size) : undefined,
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/cake-templates"
          className="eyebrow inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> All templates
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <CakeStage form={form} catalog={catalog} showDisclaimer={false} />
            {template.aiPreviewUrl && (
              <figure className="surface-card overflow-hidden rounded-3xl border border-border/60 p-3">
                <img
                  src={template.aiPreviewUrl}
                  alt={`Artistic concept illustration of the ${template.name} cake design`}
                  loading="lazy"
                  className="w-full rounded-2xl object-contain"
                />
                <figcaption className="px-2 pt-2 text-center text-[11px] text-muted-foreground">
                  An artistic AI concept of this design — a mood reference, not the cake itself.
                </figcaption>
              </figure>
            )}
            <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
              Previews are drawn from the design's configuration to help you visualise the cake.
              Final colours, decorations and finishing details are handcrafted and may vary.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              {template.category && (
                <Eyebrow className="text-primary">{template.category}</Eyebrow>
              )}
              <h1 className="mt-3 text-2xl sm:text-3xl">{template.name}</h1>
              {template.isFeatured && (
                <span className="eyebrow mt-3 inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[0.55rem] text-primary">
                  <Sparkles className="h-3 w-3" /> Featured design
                </span>
              )}
              {template.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {template.description}
                </p>
              )}
            </div>

            {lines.length > 0 && (
              <dl className="surface-card space-y-2 rounded-3xl border border-border/60 p-5 text-sm">
                {lines.map((line) => (
                  <div key={`${line.label}-${line.value}`} className="flex gap-3">
                    <dt className="w-32 shrink-0 text-muted-foreground">{line.label}</dt>
                    <dd className="flex-1">{line.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="space-y-3">
              <Button asChild className="h-12 w-full rounded-full">
                <Link to="/order" search={{ template: template.slug }}>
                  <Wand2 className="mr-2 h-4 w-4" /> Customise this cake
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                This is a starting point — change the shape, tiers, flavours, colours and
                decorations to make it yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
