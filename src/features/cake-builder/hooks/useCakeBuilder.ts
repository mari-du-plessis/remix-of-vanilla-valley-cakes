import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOptions } from "@/features/catalog/api";
import { catalogKeys } from "@/features/catalog/types";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "@/features/order/types";
import { fetchCakeAssetLinks, fetchCakeAssets } from "../api";
import { buildCakeDesign, type DesignSources } from "../lib/design";
import { cakeBuilderKeys, type CakeAsset, type CakeDesign } from "../types";

const STALE = 5 * 60 * 1000;

/** The asset library, cached for the session. */
export function useCakeAssets() {
  return useQuery({
    queryKey: cakeBuilderKeys.assets,
    queryFn: fetchCakeAssets,
    staleTime: STALE,
  });
}

/** Option ↔ asset links, the data-driven part of the mapping. */
export function useCakeAssetLinks() {
  return useQuery({
    queryKey: cakeBuilderKeys.links,
    queryFn: fetchCakeAssetLinks,
    staleTime: STALE,
  });
}

/** Everything the renderer needs, keyed by asset key. */
export function useAssetIndex(assets: CakeAsset[] | undefined) {
  return useMemo(() => new Map((assets ?? []).map((a) => [a.key, a])), [assets]);
}

/**
 * Live design derived from the wizard's form state. Purely additive: the order
 * flow keeps working exactly as before if the asset library is empty.
 */
export function useCakeDesign(
  form: OrderFormState,
  catalog: CakeCatalog,
): {
  design: CakeDesign;
  assets: CakeAsset[];
  isPending: boolean;
} {
  const assetsQuery = useCakeAssets();
  const linksQuery = useCakeAssetLinks();
  const optionsQuery = useQuery({
    queryKey: [...catalogKeys.all, "all-options"],
    queryFn: fetchAllOptions,
    staleTime: STALE,
  });

  const sources: DesignSources = useMemo(
    () => ({
      assets: assetsQuery.data ?? [],
      links: linksQuery.data ?? [],
      options: optionsQuery.data ?? [],
    }),
    [assetsQuery.data, linksQuery.data, optionsQuery.data],
  );

  const design = useMemo(() => buildCakeDesign(form, catalog, sources), [form, catalog, sources]);

  return {
    design,
    assets: sources.assets,
    isPending: assetsQuery.isPending || linksQuery.isPending || optionsQuery.isPending,
  };
}
