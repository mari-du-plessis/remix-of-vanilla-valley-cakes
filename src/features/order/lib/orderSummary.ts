import { productFamily, usesCakeRenderer } from "@/config/product-builders";
import { appearanceLines } from "@/features/cake-builder/lib/appearance";
import { requirementsFor } from "../flows/product-requirements";
import { tierLabel } from "./tiers";
import { selectionSummary } from "./selections";
import type { OrderFormState } from "../types";

export type SummaryLine = { label: string; value: string };

/**
 * The product-specific part of an order summary.
 *
 * One source of truth shared by the customer's review panel and the WhatsApp
 * message, so a rusk enquiry can never accidentally list cake fields and a
 * cake enquiry never loses one. Custom Cake answers come from the builder's
 * design fields; every other family from its catalog selections.
 */
export function productSummaryLines(
  form: OrderFormState,
  options: { sizeLabel?: string } = {},
): SummaryLine[] {
  const pretty = (value: string) =>
    value
      .replace(/^(shape|icing|decor)-/, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

  if (!usesCakeRenderer(form.product)) {
    const lines = selectionSummary(form.selections);
    /**
     * Quantity is only meaningful for families the bakery sells by amount, and
     * it is always shown for them — with the unit the bakery configured, so
     * "2 dozen" never reads as a bare "2".
     */
    const rule = requirementsFor(productFamily(form.product).builder)?.quantity;
    if (rule) {
      const unit = form.quantity === 1 ? (rule.unitOne ?? rule.unit) : rule.unit;
      lines.push({ label: "Quantity", value: `${form.quantity} ${unit}` });
    }
    return lines;
  }


  return [
    form.shapeKey ? { label: "Shape", value: pretty(form.shapeKey) } : null,
    form.size ? { label: "Size", value: options.sizeLabel ?? form.size } : null,
    form.icingKey ? { label: "Finish", value: pretty(form.icingKey) } : null,
    form.tiers.length > 1 ? { label: "Tiers", value: String(form.tiers.length) } : null,
    ...(form.tiers.length > 0
      ? form.tiers.map((t, i) => ({
          label: tierLabel(i, form.tiers.length),
          value: `${t.flavour} with ${t.filling}`,
        }))
      : [
          form.flavour ? { label: "Flavour", value: form.flavour } : null,
          form.filling ? { label: "Filling", value: form.filling } : null,
        ]),
    form.extras.length ? { label: "Extras", value: form.extras.join(", ") } : null,
    ...appearanceLines(
      form.appearance,
      form.tiers.length > 0 ? form.tiers.map((_, i) => tierLabel(i, form.tiers.length)) : ["Cake"],
    ),
    form.cakeText.trim() ? { label: "Message on cake", value: form.cakeText.trim() } : null,
  ].filter((line): line is SummaryLine => line !== null);
}

/** The full review a customer sees before sending — product lines plus context. */
export function reviewLines(
  form: OrderFormState,
  options: { sizeLabel?: string; productLabel: string } = { productLabel: "" },
): SummaryLine[] {
  const inspiration =
    form.inspirationFile?.name ??
    (form.galleryInspiration ? "From our gallery" : null);

  return [
    form.occasion ? { label: "Occasion", value: form.occasion } : null,
    options.productLabel ? { label: "Product", value: options.productLabel } : null,
    ...productSummaryLines(form, options),
    inspiration ? { label: "Inspiration photo", value: inspiration } : null,
    form.eventDate ? { label: "Date needed", value: form.eventDate } : null,
  ].filter((line): line is SummaryLine => line !== null);
}
