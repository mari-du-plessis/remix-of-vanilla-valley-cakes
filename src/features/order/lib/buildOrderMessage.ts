import { BRAND } from "@/config/brand";
import { getSizeLabel } from "@/config/catalog";
import { tierLabel } from "./tiers";
import type { OrderFormState } from "../types";

/**
 * Pure formatter for the customer's order summary.
 * Kept free of React/Supabase so quotations and PDFs can reuse it later.
 */
export function buildOrderMessage(
  form: OrderFormState,
  options: { photoLine?: string | null } = {},
): string {
  return [
    `🎂 *New Cake Order — ${BRAND.name}*`,
    ``,
    `*Occasion:* ${form.occasion}`,
    `*Size:* ${getSizeLabel(form.size)}`,
    ...(form.tiers.length > 0
      ? form.tiers.map(
          (t, i) => `*${tierLabel(i, form.tiers.length)}:* ${t.flavour} with ${t.filling}`,
        )
      : [`*Flavour:* ${form.flavour}`, `*Filling:* ${form.filling}`]),
    form.extras.length ? `*Extras:* ${form.extras.join(", ")}` : null,
    options.photoLine ?? null,
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
