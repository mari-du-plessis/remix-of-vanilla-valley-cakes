import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createPriceList,
  createPriceListItem,
  createPricingRule,
  deletePriceList,
  deletePriceListItem,
  deletePricingRule,
  getPricingSnapshot,
  listPriceLists,
  updatePriceList,
  updatePriceListItem,
  updatePricingRule,
} from "../api/pricing.functions";
import type {
  PriceListInput,
  PriceListItemInput,
  PricingRuleInput,
} from "../api/schema";
import type { PriceList, PricingSnapshot } from "../types";

export const pricingKeys = {
  all: ["pricing"] as const,
  lists: ["pricing", "lists"] as const,
  snapshot: (priceListId?: string | null) =>
    ["pricing", "snapshot", priceListId ?? "default"] as const,
};

export function usePriceLists() {
  const fetchLists = useServerFn(listPriceLists);
  return useQuery<PriceList[]>({
    queryKey: pricingKeys.lists,
    queryFn: () => fetchLists({}),
  });
}

/**
 * The single read used by every pricing consumer (admin screens today,
 * quotations and invoices later): one price list plus its items and rules.
 */
export function usePricingSnapshot(priceListId?: string | null) {
  const fetchSnapshot = useServerFn(getPricingSnapshot);
  return useQuery<PricingSnapshot | null>({
    queryKey: pricingKeys.snapshot(priceListId),
    queryFn: () => fetchSnapshot({ data: { priceListId: priceListId ?? null } }),
  });
}

/** Shared mutation wiring: invalidate all pricing queries, toast the outcome. */
function usePricingMutation<TInput>(
  run: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreatePriceList() {
  const mutate = useServerFn(createPriceList);
  return usePricingMutation(
    (input: PriceListInput) => mutate({ data: input }),
    "Price list created",
  );
}

export function useUpdatePriceList() {
  const mutate = useServerFn(updatePriceList);
  return usePricingMutation(
    (input: { id: string; values: Partial<PriceListInput> }) => mutate({ data: input }),
    "Price list updated",
  );
}

export function useDeletePriceList() {
  const mutate = useServerFn(deletePriceList);
  return usePricingMutation((id: string) => mutate({ data: { id } }), "Price list removed");
}

export function useCreatePriceListItem() {
  const mutate = useServerFn(createPriceListItem);
  return usePricingMutation(
    (input: PriceListItemInput) => mutate({ data: input }),
    "Price added",
  );
}

export function useUpdatePriceListItem() {
  const mutate = useServerFn(updatePriceListItem);
  return usePricingMutation(
    (input: { id: string; values: Partial<PriceListItemInput> }) =>
      mutate({ data: input }),
    "Price updated",
  );
}

export function useDeletePriceListItem() {
  const mutate = useServerFn(deletePriceListItem);
  return usePricingMutation((id: string) => mutate({ data: { id } }), "Price removed");
}

export function useCreatePricingRule() {
  const mutate = useServerFn(createPricingRule);
  return usePricingMutation(
    (input: PricingRuleInput) => mutate({ data: input }),
    "Pricing rule created",
  );
}

export function useUpdatePricingRule() {
  const mutate = useServerFn(updatePricingRule);
  return usePricingMutation(
    (input: { id: string; values: Partial<PricingRuleInput> }) => mutate({ data: input }),
    "Pricing rule updated",
  );
}

export function useDeletePricingRule() {
  const mutate = useServerFn(deletePricingRule);
  return usePricingMutation((id: string) => mutate({ data: { id } }), "Pricing rule removed");
}
