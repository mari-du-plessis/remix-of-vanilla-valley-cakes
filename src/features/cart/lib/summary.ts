import { sizeLabelCm, type ServingSize } from "@/features/cake-builder/lib/servings";
import { tierPositionLabel } from "@/features/cake-builder/lib/tier-position";
import type { CartItem, CustomCakeConfig, CupcakeConfig } from "../types";

export type SummaryLine = { label: string; value: string };

/**
 * Plain-language summary of one cart item.
 *
 * One source of truth for the cart, the review screen, the WhatsApp message
 * and the saved order, so a cupcake line can never pick up cake fields and a
 * cake line can never lose a tier. Each product kind contributes only its own
 * facts.
 */
export function cartItemLines(item: CartItem, chart: ServingSize[] = []): SummaryLine[] {
  if (item.config.kind === "custom_cake") return cakeLines(item.config, chart);
  if (item.config.kind === "cupcakes") return cupcakeLines(item.config);
  return item.config.notes ? [{ label: "Notes", value: item.config.notes }] : [];
}

function cakeLines(config: CustomCakeConfig, chart: ServingSize[]): SummaryLine[] {
  const lines: SummaryLine[] = [];
  if (config.occasion) lines.push({ label: "Occasion", value: config.occasion });
  if (config.requestedServings)
    lines.push({ label: "Servings needed", value: `About ${config.requestedServings} people` });
  if (config.tiers.length > 1)
    lines.push({ label: "Tiers", value: String(config.tiers.length) });

  /* Tiers are stored bottom-first and always described by their position. */
  config.tiers.forEach((tier, index) => {
    const label = tierPositionLabel(index, config.tiers.length);
    const parts = [
      tier.sizeCm ? sizeLabelCm(chart, tier.sizeCm) : null,
      tier.flavour || null,
      tier.filling ? `filled with ${tier.filling}` : null,
      tier.colour || null,
      tier.finish ? prettyKey(tier.finish) : null,
      tier.shape ? prettyKey(tier.shape) : null,
    ].filter(Boolean);
    if (parts.length) lines.push({ label, value: parts.join(" · ") });
  });

  if (config.decorations.length)
    lines.push({ label: "Decorations", value: config.decorations.join(", ") });
  if (config.candles.trim()) lines.push({ label: "Candles", value: config.candles.trim() });
  if (config.figurines.required)
    lines.push({
      label: "Figurines",
      value:
        `${config.figurines.quantity} × ` +
        (config.figurines.description.trim() || "to be discussed"),
    });
  if (config.genderReveal.trim())
    lines.push({ label: "Gender reveal", value: config.genderReveal.trim() });
  if (config.inspiration.fileName || config.inspiration.gallery)
    lines.push({
      label: "Inspiration photo",
      value: config.inspiration.gallery
        ? "From our gallery"
        : config.inspiration.fileName || "Attached",
    });
  if (config.notes.trim()) lines.push({ label: "Additional information", value: config.notes.trim() });
  return lines;
}

function cupcakeLines(config: CupcakeConfig): SummaryLine[] {
  const lines: SummaryLine[] = [];
  if (config.occasion) lines.push({ label: "Occasion", value: config.occasion });
  config.selections.forEach((selection) =>
    lines.push({ label: selection.groupLabel, value: selection.valueLabel }),
  );
  if (config.inspiration.fileName)
    lines.push({ label: "Inspiration photo", value: config.inspiration.fileName });
  if (config.notes.trim()) lines.push({ label: "Additional information", value: config.notes.trim() });
  return lines;
}

/** `icing-textured` -> `Textured`. Asset keys are never shown raw. */
function prettyKey(value: string): string {
  return value
    .replace(/^(shape|icing|decor)-/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}
