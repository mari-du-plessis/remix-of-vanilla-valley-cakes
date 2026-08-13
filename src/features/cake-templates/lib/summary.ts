import { appearanceLines } from "@/features/cake-builder/lib/appearance";
import { tierLabel } from "@/features/order/lib/tiers";
import type { CakeTemplateDesign } from "../types";

/**
 * Human-readable design summary for the template detail page.
 *
 * Built from the same helpers the WhatsApp summary and the AI prompt use, so
 * customers, the bakery and the model always read the same design.
 */
export function templateSummaryLines(
  design: CakeTemplateDesign,
  sizeLabel?: string,
): { label: string; value: string }[] {
  const pretty = (value: string) =>
    value
      .replace(/^(shape|icing|decor|size)-/, "")
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

  const tiers = design.tiers ?? [];
  const lines: { label: string; value: string }[] = [];

  if (design.shapeKey) lines.push({ label: "Shape", value: pretty(design.shapeKey) });
  if (design.size) lines.push({ label: "Size", value: sizeLabel ?? design.size });
  if (tiers.length > 1) lines.push({ label: "Tiers", value: String(tiers.length) });
  if (design.icingKey) lines.push({ label: "Finish", value: pretty(design.icingKey) });

  if (tiers.length > 0) {
    tiers.forEach((tier, i) => {
      const detail = [tier.flavour, tier.filling].filter(Boolean).join(" with ");
      if (detail) lines.push({ label: tierLabel(i, tiers.length), value: detail });
    });
  } else {
    const detail = [design.flavour, design.filling].filter(Boolean).join(" with ");
    if (detail) lines.push({ label: "Flavour", value: detail });
  }

  if (design.extras?.length) lines.push({ label: "Extras", value: design.extras.join(", ") });

  lines.push(
    ...appearanceLines(
      design.appearance,
      tiers.length > 0 ? tiers.map((_, i) => tierLabel(i, tiers.length)) : ["Cake"],
    ),
  );

  if (design.cakeText?.trim())
    lines.push({ label: "Message on cake", value: design.cakeText.trim() });

  return lines;
}
