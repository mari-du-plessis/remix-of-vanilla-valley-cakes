import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/features/catalog/api";
import { catalogKeys } from "@/features/catalog/types";
import type { Product } from "@/features/catalog/types";
import { orderFlowFor } from "./registry";
import type { OrderStepKey } from "./types";

const STALE = 5 * 60 * 1000;

/** Product kinds a customer can order through the wizard. */
const ORDERABLE_KINDS = new Set(["cake", "baked_good"]);

/**
 * Resolves the workflow for the product the customer picked, together with the
 * wizard stages that workflow needs. When the bakery only offers one orderable
 * product the "What are we baking?" stage is left out — exactly as before.
 */
export function useOrderFlow(productSlug: string) {
  const { data: products = [] } = useQuery({
    queryKey: catalogKeys.products,
    queryFn: fetchProducts,
    staleTime: STALE,
  });

  const choices: Product[] = useMemo(
    () =>
      products
        .filter((p) => p.is_active && ORDERABLE_KINDS.has(String(p.kind)))
        .sort((a, b) => a.sort_order - b.sort_order),
    [products],
  );

  const flow = orderFlowFor(productSlug);
  const steps: OrderStepKey[] = useMemo(
    () => flow.steps.filter((key) => key !== "product" || choices.length > 1),
    [flow, choices.length],
  );

  return { flow, choices, steps };
}
