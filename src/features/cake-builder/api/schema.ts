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
 * Inspiration preview input — cake information only.
 * There is deliberately no field for customer, contact, delivery, pricing,
 * quote, calendar or internal data.
 */
export const inspirationSchema = z.object({
  product: z.string().trim().max(80).default(""),
  shape: z.string().trim().max(60).default(""),
  size: z.string().trim().max(120).default(""),
  tierCount: z.number().int().min(1).max(6).default(1),
  flavours: z.array(z.string().trim().max(80)).max(6).default([]),
  fillings: z.array(z.string().trim().max(80)).max(6).default([]),
  icing: z.string().trim().max(80).default(""),
  decorations: z.array(z.string().trim().max(80)).max(20).default([]),
  message: z.string().trim().max(40).default(""),
  notes: z.string().trim().max(400).default(""),
});

export type InspirationRequest = z.infer<typeof inspirationSchema>;
