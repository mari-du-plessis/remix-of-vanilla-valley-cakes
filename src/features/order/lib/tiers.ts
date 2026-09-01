import { tierPositionLabel } from "@/features/cake-builder/lib/tier-position";

/**
 * Human label for a tier position.
 *
 * Tiers are stored **bottom-first** everywhere — index 0 is the tier standing
 * on the board, which is exactly how the geometry engine stacks them. This
 * used to be labelled top-first, so "bottom tier" edits appeared at the top of
 * the illustration. The position model in `cake-builder/lib/tier-position.ts`
 * is now the single source of truth for both.
 */
export function tierLabel(index: number, total: number): string {
  return tierPositionLabel(index, total);
}
