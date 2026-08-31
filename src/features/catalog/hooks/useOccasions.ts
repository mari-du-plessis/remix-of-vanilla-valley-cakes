import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOptions, fetchOptionGroups } from "../api";
import { ORDER_OCCASIONS } from "@/config/occasions";

export type OccasionChoice = { key: string; label: string };

/**
 * Occasions come from the catalog (`occasion` option group) so the bakery can
 * add, rename or retire them from the admin panel. The historical constant
 * list is only the fallback used before the group is configured.
 *
 * `productSlug` is accepted now so a product family can narrow its own
 * occasions later (an option's metadata may list `products`), without any
 * caller changing.
 */
export function useOccasions(productSlug?: string): {
  occasions: OccasionChoice[];
  isPending: boolean;
} {
  const { data, isPending } = useQuery({
    queryKey: ["catalog", "occasions"] as const,
    queryFn: async () => {
      const [groups, options] = await Promise.all([fetchOptionGroups(), fetchAllOptions()]);
      const group = groups.find((g) => g.key === "occasion" && g.is_active);
      if (!group) return [];
      return options
        .filter((o) => o.group_id === group.id && o.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((o) => ({
          key: o.key,
          label: o.name,
          products: Array.isArray(o.metadata?.["products"])
            ? (o.metadata["products"] as string[])
            : null,
        }));
    },
    staleTime: 10 * 60 * 1000,
  });

  const occasions = useMemo<OccasionChoice[]>(() => {
    const rows = (data ?? []).filter(
      (o) => !o.products || !productSlug || o.products.includes(productSlug),
    );
    if (rows.length > 0) return rows.map(({ key, label }) => ({ key, label }));
    return ORDER_OCCASIONS.map((label) => ({ key: label, label }));
  }, [data, productSlug]);

  return { occasions, isPending };
}

/** Baby shower cakes collect gender-reveal detail in Additional Information. */
export const isBabyShower = (occasion: string) =>
  occasion.trim().toLowerCase().includes("baby shower");
