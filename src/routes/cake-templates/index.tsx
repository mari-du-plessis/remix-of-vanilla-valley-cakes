import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/common";
import { Eyebrow } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { CategoryTabs } from "@/features/gallery/components/CategoryTabs";
import { GALLERY_ALL_TAB } from "@/config/occasions";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { TemplateCard } from "@/features/cake-templates/components/TemplateCard";
import { usePublicTemplates } from "@/features/cake-templates/hooks/useCakeTemplates";

export const Route = createFileRoute("/cake-templates/")({
  head: () => ({
    meta: [
      { title: "Cake Design Templates — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Browse Vanilla Valley's curated custom cake designs and make one your own — change the shape, tiers, colours, flowers and finishing touches.",
      },
      { property: "og:title", content: "Cake Design Templates — Vanilla Valley Bakery" },
      {
        property: "og:description",
        content: "Curated custom cake designs you can customise and order in minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { catalog } = useCakeCatalog();
  const { data: templates = [], isPending } = usePublicTemplates();
  const [category, setCategory] = useState<string>(GALLERY_ALL_TAB);

  /* Categories come from the templates themselves, so the filter always
     matches the current category configuration rather than a hardcoded list. */
  const tabs = useMemo(() => {
    const used = Array.from(
      new Set(templates.map((t) => t.category).filter((c): c is string => !!c)),
    );
    return [GALLERY_ALL_TAB, ...used];
  }, [templates]);

  const visible = useMemo(
    () =>
      category === GALLERY_ALL_TAB
        ? templates
        : templates.filter((t) => t.category === category),
    [templates, category],
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="mb-8 text-center">
          <Eyebrow className="text-primary">Curated by Vanilla Valley</Eyebrow>
          <h1 className="mt-4 text-2xl sm:text-3xl">Cake templates</h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
            Beautiful designs to begin with. Choose one, then change anything you like — shape,
            tiers, flavours, colours and finishing touches are all yours to adjust.
          </p>
        </header>

        {tabs.length > 1 && (
          <CategoryTabs
            tabs={tabs}
            active={category}
            onChange={setCategory}
            label="Filter templates by category"
          />
        )}

        {isPending ? (
          <LoadingState label="Loading designs…" />
        ) : visible.length === 0 ? (
          <EmptyState
            message={
              templates.length === 0
                ? "Our template collection is on its way. In the meantime, design your own cake from scratch."
                : "No templates in this collection yet."
            }
            action={
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/order">Design your own</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((template) => (
              <TemplateCard key={template.id} template={template} catalog={catalog} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="eyebrow inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
