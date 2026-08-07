import { z } from "zod";

/** Appearance tokens are short, kebab-case keys such as `decor-bow`. */
export const generateAssetSchema = z.object({
  token: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Token must be lowercase, kebab-case"),
  label: z.string().trim().min(1).max(80),
  /** Rendering slot, so the prompt can describe how the piece will be placed. */
  slot: z.string().trim().min(1).max(32),
});

export type GenerateAssetInput = z.infer<typeof generateAssetSchema>;

/**
 * Inspiration preview input — cake appearance information only.
 * There is deliberately no field for customer, contact, delivery, allergy,
 * pricing, quote, calendar or internal data.
 */
export const inspirationSchema = z.object({
  product: z.string().trim().max(80).default(""),
  shape: z.string().trim().max(60).default(""),
  size: z.string().trim().max(120).default(""),
  /** The bakery's maximum custom cake height is five tiers. */
  tierCount: z.number().int().min(1).max(5).default(1),
  flavours: z.array(z.string().trim().max(80)).max(5).default([]),
  fillings: z.array(z.string().trim().max(80)).max(5).default([]),
  icing: z.string().trim().max(80).default(""),
  decorations: z.array(z.string().trim().max(80)).max(20).default([]),
  message: z.string().trim().max(40).default(""),
  notes: z.string().trim().max(400).default(""),
  /** Publicly readable URL of the customer's uploaded reference photo. */
  inspirationImageUrl: z.string().trim().url().max(500).or(z.literal("")).default(""),
});

export type InspirationRequest = z.infer<typeof inspirationSchema>;
