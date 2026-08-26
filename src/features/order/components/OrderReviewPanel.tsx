import { Pencil } from "lucide-react";
import { reviewLines } from "../lib/orderSummary";
import type { OrderFormState } from "../types";

/**
 * Concise, product-appropriate review shown before sending.
 *
 * The lines come from the shared summary builder, so the customer sees exactly
 * what the bakery receives on WhatsApp — and nothing that doesn't apply to the
 * product they chose. Each line can be edited without restarting the order.
 */
export function OrderReviewPanel({
  form,
  productLabel,
  sizeLabel,
  onEdit,
}: {
  form: OrderFormState;
  productLabel: string;
  sizeLabel?: string;
  /** Takes the customer back to the stage that owns these answers. */
  onEdit?: () => void;
}) {
  const lines = reviewLines(form, { productLabel, ...(sizeLabel ? { sizeLabel } : {}) });
  if (lines.length === 0) return null;

  return (
    <div className="surface-card rounded-2xl border border-border/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-[0.6rem] text-primary">Your request</p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" /> Change something
          </button>
        )}
      </div>
      <dl className="mt-3 space-y-2">
        {lines.map((line) => (
          <div
            key={`${line.label}-${line.value}`}
            className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-3"
          >
            <dt className="shrink-0 text-muted-foreground sm:min-w-28">{line.label}</dt>
            <dd className="min-w-0 flex-1 break-words">{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
