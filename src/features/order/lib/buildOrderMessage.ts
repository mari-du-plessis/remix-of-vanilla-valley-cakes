import { BRAND } from "@/config/brand";
import { productFamily } from "@/config/product-builders";
import { appearanceLines } from "@/features/cake-builder/lib/appearance";
import { tierLabel } from "./tiers";
import type { OrderFormState } from "../types";

/**
 * Pure formatter for the customer's order summary.
 *
 * Kept free of React/Supabase so quotations and PDFs can reuse it later. It
 * carries everything the bakery needs to quote without a follow-up question:
 * the design, the dates, the contact details and links to both previews.
 */
export function buildOrderMessage(
  form: OrderFormState,
  options: { photoLine?: string | null; sizeLabel?: string; orderNumber?: string | null } = {},
): string {
  /** Builder answers only appear when the customer actually made them. */
  const pretty = (value: string) =>
    value
      .replace(/^(shape|icing|decor)-/, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

  const family = productFamily(form.product);
  const heading = [family.emoji, `*New ${family.noun} Request — ${BRAND.name}*`]
    .filter(Boolean)
    .join(" ");

  return [
    heading,
    options.orderNumber ? `*Reference:* ${options.orderNumber}` : null,
    ``,
    `*Occasion:* ${form.occasion}`,
    `*Product:* ${family.label}`,
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
    ...appearanceLines(
      form.appearance,
      form.tiers.length > 0
        ? form.tiers.map((_, i) => tierLabel(i, form.tiers.length))
        : ["Cake"],
    ).map((line) => `*${line.label}:* ${line.value}`),
    form.cakeText.trim() ? `*Message on cake:* ${form.cakeText.trim()}` : null,
    ``,
    `*Event date:* ${form.eventDate}`,
    options.photoLine ?? null,
    form.aiPreviewUrl ? `*AI concept:* ${form.aiPreviewUrl}` : null,
    ``,
    `*Name:* ${form.name}`,
    `*Phone:* ${form.phone}`,
    form.email ? `*Email:* ${form.email}` : null,
    form.notes ? `\n*Notes:* ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
