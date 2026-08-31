/**
 * Explicit tier positions.
 *
 * A cake tier's physical position is part of the domain model, never an
 * accident of array order. Tiers are always stored **bottom-first** (index 0
 * is the tier standing on the board) and every consumer — the wizard, the
 * summary, the WhatsApp message, the saved order and the SVG renderer — reads
 * `position` rather than inferring it from the index.
 *
 * This is what fixes the historical bug where changing the "bottom tier"
 * colour repainted the top of the illustration: the labels said one thing and
 * the geometry another. Now there is a single source of truth.
 */

export type TierPosition = "bottom" | "middle" | "top";

/** Position of the tier at `index` in a bottom-first stack of `total` tiers. */
export function tierPositionAt(index: number, total: number): TierPosition {
  if (total <= 1) return "bottom";
  if (index === 0) return "bottom";
  if (index === total - 1) return "top";
  return "middle";
}

/** Customer-facing label for a tier, e.g. "Bottom tier" or "Middle tier (2)". */
export function tierPositionLabel(index: number, total: number): string {
  const position = tierPositionAt(index, total);
  if (total <= 1) return "Your cake";
  if (position === "bottom") return "Bottom tier";
  if (position === "top") return "Top tier";
  /* Four and five tier cakes have more than one middle: number them from the
     bottom up so the customer and the baker read the stack the same way. */
  return total > 3 ? `Middle tier ${index}` : "Middle tier";
}

/**
 * Re-stamps positions after tiers are added, removed or reordered.
 * Callers never set `position` by hand.
 */
export function withPositions<T extends { position: TierPosition }>(tiers: T[]): T[] {
  return tiers.map((tier, index) => ({
    ...tier,
    position: tierPositionAt(index, tiers.length),
  }));
}
