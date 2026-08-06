import type { Database } from "@/integrations/supabase/types";

export type PriceTargetType = Database["public"]["Enums"]["price_target_type"];
export type PriceUnit = Database["public"]["Enums"]["price_unit"];
export type PricingRuleType = Database["public"]["Enums"]["pricing_rule_type"];
export type PricingAdjustmentType =
  Database["public"]["Enums"]["pricing_adjustment_type"];

/** A named, dated set of prices. Seasonal pricing = a second price list. */
export type PriceList = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

/**
 * One priced line inside a price list. The `targetType` discriminates what the
 * price applies to (product, option, tier count, delivery, rush…), so new
 * priced concepts never need a new table.
 */
export type PriceListItem = {
  id: string;
  priceListId: string;
  targetType: PriceTargetType;
  productId: string | null;
  optionId: string | null;
  sizeKey: string | null;
  tierCount: number | null;
  label: string;
  amountCents: number;
  unit: PriceUnit;
  minQuantity: number;
  sortOrder: number;
  isActive: boolean;
  notes: string | null;
};

/** A conditional adjustment applied on top of the priced lines. */
export type PricingRule = {
  id: string;
  priceListId: string | null;
  ruleType: PricingRuleType;
  name: string;
  description: string | null;
  adjustmentType: PricingAdjustmentType;
  /** Cents when `fixed`, basis points-free percent (e.g. 15 = 15%) when `percentage`. */
  adjustmentValue: number;
  conditions: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
};

/** Everything the pricing engine needs for one price list. */
export type PricingSnapshot = {
  priceList: PriceList;
  items: PriceListItem[];
  rules: PricingRule[];
};

export const PRICE_TARGET_LABELS: Record<PriceTargetType, string> = {
  product: "Product base price",
  option: "Option adjustment",
  tier: "Tier price",
  delivery: "Delivery",
  rush: "Rush fee",
  service: "Service",
  custom: "Custom",
};

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  flat: "Flat",
  per_serving: "Per serving",
  per_tier: "Per tier",
  per_km: "Per km",
  per_hour: "Per hour",
  percentage: "Percentage",
};

export const PRICING_RULE_LABELS: Record<PricingRuleType, string> = {
  rush_order: "Rush order",
  delivery_zone: "Delivery zone",
  weekend_surcharge: "Weekend surcharge",
  holiday_surcharge: "Holiday surcharge",
  seasonal_promotion: "Seasonal promotion",
  minimum_order: "Minimum order value",
  custom: "Custom rule",
};
