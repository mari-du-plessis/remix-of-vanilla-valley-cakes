import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  idSchema,
  priceListIdSchema,
  priceListInputSchema,
  priceListItemInputSchema,
  pricingRuleInputSchema,
  updatePriceListItemSchema,
  updatePriceListSchema,
  updatePricingRuleSchema,
} from "./schema";
import {
  deleteRow,
  fetchPriceListItems,
  fetchPriceLists,
  fetchPricingRules,
  insertPriceList,
  insertPriceListItem,
  insertPricingRule,
  updatePriceListItemRow,
  updatePriceListRow,
  updatePricingRuleRow,
} from "./pricing.server";
import type { PricingSnapshot } from "../types";

/**
 * Pricing is internal-only: every function is admin-authenticated. Customers
 * never read prices — they request quotations.
 */

export const listPriceLists = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchPriceLists(context.supabase));

/**
 * One price list plus its items and applicable rules. This is the single input
 * the pricing engine needs, so quotations, PDFs and invoices can all reuse it.
 */
export const getPricingSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => priceListIdSchema.parse(data))
  .handler(async ({ data, context }): Promise<PricingSnapshot | null> => {
    const { supabase } = context;
    const lists = await fetchPriceLists(supabase);
    const priceList =
      lists.find((list) => list.id === data.priceListId) ??
      lists.find((list) => list.isDefault) ??
      lists[0];
    if (!priceList) return null;
    const [items, rules] = await Promise.all([
      fetchPriceListItems(supabase, priceList.id),
      fetchPricingRules(supabase, priceList.id),
    ]);
    return { priceList, items, rules };
  });

export const createPriceList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => priceListInputSchema.parse(data))
  .handler(async ({ data, context }) => insertPriceList(context.supabase, data));

export const updatePriceList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updatePriceListSchema.parse(data))
  .handler(async ({ data, context }) =>
    updatePriceListRow(context.supabase, data.id, data.values),
  );

export const deletePriceList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "price_lists", data.id),
  );

export const createPriceListItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => priceListItemInputSchema.parse(data))
  .handler(async ({ data, context }) => insertPriceListItem(context.supabase, data));

export const updatePriceListItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updatePriceListItemSchema.parse(data))
  .handler(async ({ data, context }) =>
    updatePriceListItemRow(context.supabase, data.id, data.values),
  );

export const deletePriceListItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "price_list_items", data.id),
  );

export const createPricingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => pricingRuleInputSchema.parse(data))
  .handler(async ({ data, context }) => insertPricingRule(context.supabase, data));

export const updatePricingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updatePricingRuleSchema.parse(data))
  .handler(async ({ data, context }) =>
    updatePricingRuleRow(context.supabase, data.id, data.values),
  );

export const deletePricingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) =>
    deleteRow(context.supabase, "pricing_rules", data.id),
  );
