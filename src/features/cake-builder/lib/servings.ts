/**
 * Serving chart and tier-size recommendation — pure domain logic.
 *
 * Vanilla Valley sizes cakes in **centimetres** and quotes servings from its
 * own cutting chart. The chart lives in the database (`serving_sizes`) so the
 * bakery can adjust it; the constant below is only the fallback used before
 * that data arrives, and it mirrors the current printed chart exactly.
 *
 * Nothing here touches React or Supabase: the same maths drives the customer
 * wizard, the admin capture screen and any future quotation.
 */

export type ServingSize = {
  /** Diameter in centimetres. */
  sizeCm: number;
  /** Servings the bakery quotes for that size. */
  servings: number;
  label: string;
};

/** The current Vanilla Valley cutting chart. */
export const FALLBACK_SERVING_CHART: ServingSize[] = [
  { sizeCm: 10, servings: 6, label: "10 cm" },
  { sizeCm: 12.5, servings: 8, label: "12.5 cm" },
  { sizeCm: 15, servings: 12, label: "15 cm" },
  { sizeCm: 18, servings: 16, label: "18 cm" },
  { sizeCm: 20, servings: 24, label: "20 cm" },
  { sizeCm: 23, servings: 32, label: "23 cm" },
  { sizeCm: 25, servings: 38, label: "25 cm" },
  { sizeCm: 28, servings: 46, label: "28 cm" },
  { sizeCm: 30, servings: 56, label: "30 cm" },
];

/** Servings for a size, or 0 when the size is not on the chart. */
export function servingsFor(chart: ServingSize[], sizeCm: number | null): number {
  if (sizeCm == null) return 0;
  return chart.find((s) => s.sizeCm === sizeCm)?.servings ?? 0;
}

export function sizeLabelCm(chart: ServingSize[], sizeCm: number | null): string {
  if (sizeCm == null) return "Not chosen yet";
  return chart.find((s) => s.sizeCm === sizeCm)?.label ?? `${sizeCm} cm`;
}

/**
 * Recommends one size per tier for the requested number of servings.
 *
 * Rules the bakery asked for, in priority order:
 *   1. Never fewer servings than requested — always round **up**.
 *   2. Smallest sensible overage.
 *   3. Larger tiers below smaller tiers (returned bottom-first).
 *
 * Tiers are strictly decreasing in size where the chart allows it, because a
 * stacked cake needs each tier narrower than the one beneath it. If no
 * combination can reach the requested servings, the largest possible stack is
 * returned — the bakery would rather discuss a bigger cake than silently quote
 * a smaller one.
 */
export function recommendTierSizes(
  requestedServings: number,
  tierCount: number,
  chart: ServingSize[] = FALLBACK_SERVING_CHART,
): number[] {
  const sizes = [...chart].sort((a, b) => a.sizeCm - b.sizeCm);
  const count = Math.max(1, Math.min(5, Math.floor(tierCount) || 1));
  if (sizes.length === 0) return [];

  const target = Math.max(0, Math.floor(requestedServings) || 0);

  type Combination = { sizes: number[]; total: number };
  const found: { best?: Combination; largest?: Combination } = {};

  /**
   * Walk strictly decreasing combinations bottom-first. `maxIndex` is the
   * largest chart entry the next (higher) tier may use.
   */
  const walk = (remaining: number, maxIndex: number, picked: number[], total: number) => {
    if (remaining === 0) {
      const candidate: Combination = { sizes: [...picked], total };
      const largest = found.largest;
      if (!largest || candidate.total > largest.total) found.largest = candidate;
      if (candidate.total < target) return;
      const best = found.best;
      if (
        !best ||
        candidate.total < best.total ||
        /* Same overage: prefer the stack whose bottom tier is smaller. */
        (candidate.total === best.total && (candidate.sizes[0] ?? 0) < (best.sizes[0] ?? 0))
      ) {
        found.best = candidate;
      }
      return;
    }
    /* Each tier above must be strictly smaller, so we need `remaining - 1`
       chart entries left below `maxIndex`. */
    for (let i = maxIndex; i >= remaining - 1; i -= 1) {
      const size = sizes[i]!;
      walk(remaining - 1, i - 1, [...picked, size.sizeCm], total + size.servings);
    }
  };

  walk(count, sizes.length - 1, [], 0);

  const chosen = found.best ?? found.largest;
  return chosen ? chosen.sizes : [];
}

/** Total servings of an actual tier selection. */
export function totalServings(
  tierSizes: (number | null)[],
  chart: ServingSize[] = FALLBACK_SERVING_CHART,
): number {
  return tierSizes.reduce<number>((sum, size) => sum + servingsFor(chart, size), 0);
}
