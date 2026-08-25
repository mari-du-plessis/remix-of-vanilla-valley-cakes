import { BRAND } from "@/config/brand";
import { productFamily } from "@/config/product-builders";
import { productSummaryLines } from "./orderSummary";
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
  const family = productFamily(form.product);
  const heading = [family.emoji, `*New ${family.noun} Request — ${BRAND.name}*`]
    .filter(Boolean)
    .join(" ");

  /**
   * Product-specific detail comes from the shared summary builder, so a rusk
   * enquiry never carries cake fields and a cake enquiry never loses one.
   */
  const detailLines = productSummaryLines(
    form,
    options.sizeLabel ? { sizeLabel: options.sizeLabel } : {},
  ).map((line) => `*${line.label}:* ${line.value}`);


  return [
    heading,
    options.orderNumber ? `*Reference:* ${options.orderNumber}` : null,
    ``,
    `*Occasion:* ${form.occasion}`,
    `*Product:* ${family.label}`,
    ...detailLines,


    ``,
    `*Event date:* ${form.eventDate}`,
    options.photoLine ?? null,
    form.galleryInspiration
      ? `*Gallery inspiration (${BRAND.name}):* ${form.galleryInspiration.url}`
      : null,
    form.aiPreviewUrl ? `*AI concept:* ${form.aiPreviewUrl}` : null,
    /* Reference only — the structured design above is what was ordered. */
    form.templateRef ? `*Started from template:* ${form.templateRef.name}` : null,
    ``,
    `*Name:* ${form.name}`,
    `*Phone:* ${form.phone}`,
    form.email ? `*Email:* ${form.email}` : null,
    form.notes ? `\n*Notes:* ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
