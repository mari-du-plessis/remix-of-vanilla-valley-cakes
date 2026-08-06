import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PriceList, PriceListItem, PricingRule } from "../types";
import type { PriceListInput, PriceListItemInput, PricingRuleInput } from "./schema";

type Client = SupabaseClient<Database>;

/* eslint-disable @typescript-eslint/no-explicit-any */

/* --------------------------------- mappers -------------------------------- */

export const mapPriceList = (row: any): PriceList => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description ?? null,
  currency: row.currency,
  isDefault: row.is_default,
  isActive: row.is_active,
  effectiveFrom: row.effective_from ?? null,
  effectiveTo: row.effective_to ?? null,
});

export const mapPriceListItem = (row: any): PriceListItem => ({
  id: row.id,
  priceListId: row.price_list_id,
  targetType: row.target_type,
  productId: row.product_id ?? null,
  optionId: row.option_id ?? null,
  sizeKey: row.size_key ?? null,
  tierCount: row.tier_count ?? null,
  label: row.label,
  amountCents: row.amount_cents,
  unit: row.unit,
  minQuantity: row.min_quantity,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  notes: row.notes ?? null,
});

export const mapPricingRule = (row: any): PricingRule => ({
  id: row.id,
  priceListId: row.price_list_id ?? null,
  ruleType: row.rule_type,
  name: row.name,
  description: row.description ?? null,
  adjustmentType: row.adjustment_type,
  adjustmentValue: row.adjustment_value,
  conditions: (row.conditions ?? {}) as Record<string, unknown>,
  priority: row.priority,
  isActive: row.is_active,
  effectiveFrom: row.effective_from ?? null,
  effectiveTo: row.effective_to ?? null,
});

/* -------------------------------- row shapes ------------------------------ */

const nullify = <T>(value: T | undefined | null) => (value === undefined ? undefined : value);

export const priceListRow = (input: Partial<PriceListInput>) => ({
  slug: input.slug,
  name: input.name,
  description: nullify(input.description),
  currency: input.currency,
  is_default: input.isDefault,
  is_active: input.isActive,
  effective_from: nullify(input.effectiveFrom),
  effective_to: nullify(input.effectiveTo),
});

export const priceListItemRow = (input: Partial<PriceListItemInput>) => ({
  price_list_id: input.priceListId,
  target_type: input.targetType,
  product_id: nullify(input.productId),
  option_id: nullify(input.optionId),
  size_key: nullify(input.sizeKey),
  tier_count: nullify(input.tierCount),
  label: input.label,
  amount_cents: input.amountCents,
  unit: input.unit,
  min_quantity: input.minQuantity,
  sort_order: input.sortOrder,
  is_active: input.isActive,
  notes: nullify(input.notes),
});

export const pricingRuleRow = (input: Partial<PricingRuleInput>) => ({
  price_list_id: nullify(input.priceListId),
  rule_type: input.ruleType,
  name: input.name,
  description: nullify(input.description),
  adjustment_type: input.adjustmentType,
  adjustment_value: input.adjustmentValue,
  conditions: input.conditions as never,
  priority: input.priority,
  is_active: input.isActive,
  effective_from: nullify(input.effectiveFrom),
  effective_to: nullify(input.effectiveTo),
});

const clean = <T extends Record<string, unknown>>(row: T) =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined)) as T;

/* ---------------------------------- reads --------------------------------- */

export async function fetchPriceLists(client: Client): Promise<PriceList[]> {
  const { data, error } = await client
    .from("price_lists")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPriceList);
}

export async function fetchPriceListItems(
  client: Client,
  priceListId: string,
): Promise<PriceListItem[]> {
  const { data, error } = await client
    .from("price_list_items")
    .select("*")
    .eq("price_list_id", priceListId)
    .order("target_type")
    .order("sort_order")
    .order("label");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPriceListItem);
}

export async function fetchPricingRules(
  client: Client,
  priceListId?: string | null,
): Promise<PricingRule[]> {
  let query = client.from("pricing_rules").select("*");
  // Rules with a null price list are global and apply to every list.
  if (priceListId) query = query.or(`price_list_id.eq.${priceListId},price_list_id.is.null`);
  const { data, error } = await query
    .order("priority", { ascending: false })
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPricingRule);
}

/* --------------------------------- writes --------------------------------- */

/** Only one price list may be the default; clearing happens server-side. */
async function clearOtherDefaults(client: Client, keepId?: string) {
  let query = client.from("price_lists").update({ is_default: false }).eq("is_default", true);
  if (keepId) query = query.neq("id", keepId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function insertPriceList(client: Client, input: PriceListInput) {
  if (input.isDefault) await clearOtherDefaults(client);
  const { data, error } = await client
    .from("price_lists")
    .insert(clean(priceListRow(input)) as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPriceList(data);
}

export async function updatePriceListRow(
  client: Client,
  id: string,
  values: Partial<PriceListInput>,
) {
  if (values.isDefault) await clearOtherDefaults(client, id);
  const { data, error } = await client
    .from("price_lists")
    .update(clean(priceListRow(values)) as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPriceList(data);
}

export async function insertPriceListItem(client: Client, input: PriceListItemInput) {
  const { data, error } = await client
    .from("price_list_items")
    .insert(clean(priceListItemRow(input)) as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPriceListItem(data);
}

export async function updatePriceListItemRow(
  client: Client,
  id: string,
  values: Partial<PriceListItemInput>,
) {
  const { data, error } = await client
    .from("price_list_items")
    .update(clean(priceListItemRow(values)) as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPriceListItem(data);
}

export async function insertPricingRule(client: Client, input: PricingRuleInput) {
  const { data, error } = await client
    .from("pricing_rules")
    .insert(clean(pricingRuleRow(input)) as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPricingRule(data);
}

export async function updatePricingRuleRow(
  client: Client,
  id: string,
  values: Partial<PricingRuleInput>,
) {
  const { data, error } = await client
    .from("pricing_rules")
    .update(clean(pricingRuleRow(values)) as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPricingRule(data);
}

export async function deleteRow(
  client: Client,
  table: "price_lists" | "price_list_items" | "pricing_rules",
  id: string,
) {
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { id };
}
