import { reviewLines } from "../lib/orderSummary";
import type { OrderFormState } from "../types";

/**
 * Concise, product-appropriate review shown before sending.
 *
 * The lines come from the shared summary builder, so the customer sees exactly
 * what the bakery receives on WhatsApp — and nothing that doesn't apply to the
 * product they chose.
 */
export function OrderReviewPanel({
  form,
  productLabel,
  sizeLabel,
}: {
  form: OrderFormState;
  productLabel: string;
  sizeLabel?: string;
}) {
  const lines = reviewLines(form, { productLabel, ...(sizeLabel ? { sizeLabel } : {}) });
  if (lines.length === 0) return null;

  return (
    <div className="surface-card rounded-2xl border border-border/60 p-4">
      <p className="eyebrow text-[0.6rem] text-primary">Your request</p>
      <dl className="mt-3 space-y-2">
        {lines.map((line) => (
          <div key={`${line.label}-${line.value}`} className="flex gap-3 text-sm">
            <dt className="min-w-28 shrink-0 text-muted-foreground">{line.label}</dt>
            <dd className="min-w-0 flex-1">{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
