import { z } from "zod";

/** Validation contracts for the pricing module (client + server safe). */

const trimmed = (max: number) => z.string().trim().max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const optionalDate = isoDate.nullable().optional();

export const priceTargetTypeSchema = z.enum([
  "product",
  "option",
  "tier",
  "delivery",
  "rush",
  "service",
  "custom",
]);

export const priceUnitSchema = z.enum([
  "flat",
  "per_serving",
  "per_tier",
  "per_km",
  "per_hour",
  "percentage",
]);

export const pricingRuleTypeSchema = z.enum([
  "rush_order",
  "delivery_zone",
  "weekend_surcharge",
  "holiday_surcharge",
  "seasonal_promotion",
  "minimum_order",
  "custom",
]);

export const pricingAdjustmentTypeSchema = z.enum(["fixed", "percentage"]);

export const idSchema = z.object({ id: z.string().uuid() });

export const priceListInputSchema = z.object({
  slug: trimmed(60).min(1, "Slug is required"),
  name: trimmed(120).min(1, "Name is required"),
  description: trimmed(500).nullable().optional(),
  currency: trimmed(3).default("ZAR"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  effectiveFrom: optionalDate,
  effectiveTo: optionalDate,
});

export const updatePriceListSchema = z.object({
  id: z.string().uuid(),
  values: priceListInputSchema.partial(),
});

export const priceListItemInputSchema = z.object({
  priceListId: z.string().uuid(),
  targetType: priceTargetTypeSchema,
  productId: z.string().uuid().nullable().optional(),
  optionId: z.string().uuid().nullable().optional(),
  sizeKey: trimmed(60).nullable().optional(),
  tierCount: z.number().int().min(1).max(12).nullable().optional(),
  label: trimmed(160).min(1, "Label is required"),
  amountCents: z.number().int().min(-100_000_00).max(100_000_00),
  unit: priceUnitSchema.default("flat"),
  minQuantity: z.number().int().min(1).max(10_000).default(1),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
  notes: trimmed(500).nullable().optional(),
});

export const updatePriceListItemSchema = z.object({
  id: z.string().uuid(),
  values: priceListItemInputSchema.partial(),
});

export const pricingRuleInputSchema = z
  .object({
    priceListId: z.string().uuid().nullable().optional(),
    ruleType: pricingRuleTypeSchema,
    name: trimmed(120).min(1, "Name is required"),
    description: trimmed(500).nullable().optional(),
    adjustmentType: pricingAdjustmentTypeSchema.default("fixed"),
    adjustmentValue: z.number().int().min(-100_000_00).max(100_000_00),
    conditions: z.record(z.string(), z.unknown()).default({}),
    priority: z.number().int().min(0).max(1000).default(0),
    isActive: z.boolean().default(true),
    effectiveFrom: optionalDate,
    effectiveTo: optionalDate,
  })
  .refine(
    (value) =>
      !value.effectiveFrom || !value.effectiveTo || value.effectiveTo >= value.effectiveFrom,
    { message: "End date must be on or after the start date", path: ["effectiveTo"] },
  );

export const updatePricingRuleSchema = z.object({
  id: z.string().uuid(),
  values: pricingRuleInputSchema.innerType().partial(),
});

export const priceListIdSchema = z.object({
  priceListId: z.string().uuid().nullable().optional(),
});

export type PriceListInput = z.input<typeof priceListInputSchema>;
export type PriceListItemInput = z.input<typeof priceListItemInputSchema>;
export type PricingRuleInput = z.input<typeof pricingRuleInputSchema>;
