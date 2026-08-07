import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "@/features/order/types";
import { CakeBuilderPreview } from "./CakeBuilderPreview";

/**
 * CakeStage — the framed, always-visible home of the live illustration.
 *
 * Purely presentational: it owns the luxury framing, the reassurance copy and
 * the summary caption, so the preview can be dropped into the customer wizard,
 * an admin capture screen or a saved template without repeating this chrome.
 */
export function CakeStage({
  form,
  catalog,
  caption,
  className,
  children,
}: {
  form: OrderFormState;
  catalog: CakeCatalog;
  caption?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "surface-card overflow-hidden rounded-3xl border border-border/60",
        className,
      )}
    >
      <div className="relative flex items-end justify-center bg-[radial-gradient(120%_90%_at_50%_10%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_70%)] px-4 pt-4">
        <CakeBuilderPreview form={form} catalog={catalog} className="h-56 w-full sm:h-72" />
      </div>

      {caption && (
        <p className="px-5 pt-2 text-center text-sm text-foreground/80">{caption}</p>
      )}

      <p className="px-5 pb-4 pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        This illustration is intended to give an idea of your cake design. Final colours,
        decorations and handcrafted details may vary slightly. You can still upload
        inspiration photos and include additional notes to help us understand your vision.
      </p>

      {children}
    </div>
  );
}
