import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/common";
import { Eyebrow } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { SavedDesignCard } from "@/features/saved-designs/components/SavedDesignCard";
import {
  useSavedDesignActions,
  useSavedDesigns,
} from "@/features/saved-designs/hooks/useSavedDesigns";

export const Route = createFileRoute("/saved-designs")({
  head: () => ({
    meta: [
      { title: "Your Saved Cake Designs — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Revisit the cake designs you created in the Vanilla Valley cake builder, adjust them, or send one to us for a quotation.",
      },
      { property: "og:title", content: "Your Saved Cake Designs — Vanilla Valley Bakery" },
      {
        property: "og:description",
        content: "Revisit, adjust and order the cake designs you saved in our cake builder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedDesignsPage,
});

function SavedDesignsPage() {
  const { catalog } = useCakeCatalog();
  const { data: designs = [], isPending } = useSavedDesigns("active");
  const { remove } = useSavedDesignActions();

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 text-center">
          <Eyebrow className="text-primary">Your studio</Eyebrow>
          <h1 className="mt-4 text-2xl sm:text-3xl">Saved designs</h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
            Designs are kept on this device. Pick one up where you left off, or send it to us for a
            quotation whenever you're ready.
          </p>
        </header>

        {isPending ? (
          <LoadingState label="Loading your designs…" />
        ) : designs.length === 0 ? (
          <EmptyState
            message="You haven't saved a design yet."
            action={
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/order">Start designing</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <SavedDesignCard
                key={design.id}
                design={design}
                catalog={catalog}
                onDelete={(id) => remove.mutate(id)}
              />
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
