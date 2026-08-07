import { BRAND } from "@/config/brand";
import { tierLabel } from "./tiers";
import type { OrderFormState } from "../types";

/**
 * Pure formatter for the customer's order summary.
 * Kept free of React/Supabase so quotations and PDFs can reuse it later.
 * The caller resolves the size label from the catalog.
 */
export function buildOrderMessage(
  form: OrderFormState,
  options: { photoLine?: string | null; sizeLabel?: string } = {},
): string {
  /** Builder answers only appear when the customer actually made them. */
  const pretty = (value: string) =>
    value
      .replace(/^(shape|icing|decor)-/, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

  return [
    `🎂 *New Cake Order — ${BRAND.name}*`,
    ``,
    `*Occasion:* ${form.occasion}`,
    form.product ? `*Product:* ${pretty(form.product)}` : null,
    form.shapeKey ? `*Shape:* ${pretty(form.shapeKey)}` : null,
    `*Size:* ${options.sizeLabel ?? form.size}`,
    form.icingKey ? `*Finish:* ${pretty(form.icingKey)}` : null,
    form.tiers.length > 1 ? `*Tiers:* ${form.tiers.length}` : null,
    ...(form.tiers.length > 0

      ? form.tiers.map(
          (t, i) => `*${tierLabel(i, form.tiers.length)}:* ${t.flavour} with ${t.filling}`,
        )
      : [`*Flavour:* ${form.flavour}`, `*Filling:* ${form.filling}`]),
    form.extras.length ? `*Extras:* ${form.extras.join(", ")}` : null,
    form.cakeText.trim() ? `*Message on cake:* ${form.cakeText.trim()}` : null,

    options.photoLine ?? null,
    form.aiPreviewUrl ? `*Inspiration preview:* ${form.aiPreviewUrl}` : null,
    `*Event date:* ${form.eventDate}`,
    ``,
    ``,
    `*Name:* ${form.name}`,
    `*Phone:* ${form.phone}`,
    form.email ? `*Email:* ${form.email}` : null,
    form.notes ? `\n*Notes:* ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
