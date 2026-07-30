/** Human label for a tier position, given the total number of tiers. */
export function tierLabel(index: number, total: number): string {
  if (total === 2) return index === 0 ? "Top tier" : "Bottom tier";
  if (total === 3) return ["Top tier", "Middle tier", "Bottom tier"][index];
  return `Tier ${index + 1}`;
}
