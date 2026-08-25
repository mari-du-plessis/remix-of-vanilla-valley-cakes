import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productFamily } from "@/config/product-builders";
import { fetchAllOptions, fetchOptionGroups } from "@/features/catalog/api";
import { catalogKeys } from "@/features/catalog/types";
import { requirementsFor, type QuantityRule } from "../flows/product-requirements";

const STALE = 5 * 60 * 1000;

export type SelectionOption = {
  key: string;
  name: string;
  description: string | null;
};

export type SelectionGroup = {
  key: string;
  name: string;
  description: string | null;
  multi: boolean;
  required: boolean;
  options: SelectionOption[];
};

/**
 * Resolves the questions a non-cake product family asks, from the catalog.
 *
 * The family decides *which* groups are asked (`product-requirements.ts`); the
 * database decides what is inside them. Groups with no active options are
 * dropped, so an unfinished list never shows the customer an empty question.
 */
export function useProductSelections(productSlug: string) {
  const requirements = requirementsFor(productFamily(productSlug).builder);

  const { data, isPending } = useQuery({
    queryKey: catalogKeys.selections,
    queryFn: async () => {
      const [groups, options] = await Promise.all([fetchOptionGroups(), fetchAllOptions()]);
      return { groups, options };
    },
    staleTime: STALE,
  });

  const groups: SelectionGroup[] = useMemo(() => {
    if (!requirements || !data) return [];
    return requirements.groupKeys
      .map((key) => {
        const group = data.groups.find((g) => g.key === key && g.is_active);
        if (!group) return null;
        const options = data.options
          .filter((o) => o.group_id === group.id && o.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((o) => ({ key: o.key, name: o.name, description: o.description }));
        if (options.length === 0) return null;
        return {
          key: group.key,
          name: group.name,
          description: group.description,
          multi: group.select_type === "multi",
          required: group.is_required,
          options,
        } satisfies SelectionGroup;
      })
      .filter((g): g is SelectionGroup => g !== null);
  }, [requirements, data]);

  const requiredKeys = useMemo(
    () => groups.filter((g) => g.required).map((g) => g.key),
    [groups],
  );

  const quantity: QuantityRule | null = requirements?.quantity ?? null;

  return {
    groups,
    requiredKeys,
    quantity,
    headline: requirements?.headline ?? "Your order",
    stepLabel: requirements?.stepLabel ?? "Choices",
    /** Only families the bakery works from a reference photo for. */
    inspiration: requirements?.inspiration ?? false,
    inspirationHint: requirements?.inspirationHint,
    isPending,
  };
}
