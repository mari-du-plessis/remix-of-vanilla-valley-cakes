import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOptions, fetchOptionGroups, fetchOptionRules } from "../api";
import { catalogKeys } from "../types";
import {
  buildCakeCatalog,
  FALLBACK_CAKE_CATALOG,
  type CakeCatalog,
} from "../lib/cake-catalog";

/**
 * Single read path for the cake configuration used by the order wizard.
 * Returns the static fallback while loading (and if the catalog is empty),
 * so the form never renders without choices.
 */
export function useCakeCatalog(): { catalog: CakeCatalog; isPending: boolean } {
  const { data, isPending } = useQuery({
    queryKey: catalogKeys.cake,
    queryFn: async () => {
      const [groups, options, rules] = await Promise.all([
        fetchOptionGroups(),
        fetchAllOptions(),
        fetchOptionRules(),
      ]);
      return buildCakeCatalog(groups, options, rules);
    },
    staleTime: 5 * 60 * 1000,
  });

  const catalog = useMemo(() => data ?? FALLBACK_CAKE_CATALOG, [data]);
  return { catalog, isPending };
}
