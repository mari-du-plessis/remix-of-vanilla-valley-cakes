import { z } from "zod";

/** Validation contracts for the quote module (client + server safe). */

const trimmed = (max: number) => z.string().trim().max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const quoteStatusSchema = z.enum([
  "draft",
  "finalised",
  "sent",
  "accepted",
  "declined",
  "expired",
  "archived",
]);

export const quoteLineKindSchema = z.enum([
  "product",
  "option",
  "tier",
  "service",
  "delivery",
  "rush",
  "rule",
  "discount",
  "charge",
  "custom",
]);

export const quoteIdSchema = z.object({ quoteId: z.string().uuid() });

export const listQuotesSchema = z.object({
  status: z.union([quoteStatusSchema, z.literal("all")]).default("all"),
  search: trimmed(100).optional(),
  orderId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(200).default(100),
});

/**
 * Generating a quote never takes prices from the client — the server runs the
 * pricing engine against the stored order and the chosen price list.
 */
export const generateQuoteSchema = z.object({
  orderId: z.string().uuid(),
  priceListId: z.string().uuid().nullable().optional(),
  /** Days the quote stays valid; drives `valid_until`. */
  validForDays: z.number().int().min(1).max(365).default(14),
});

export const quoteLineInputSchema = z.object({
  quoteId: z.string().uuid(),
  kind: quoteLineKindSchema.default("custom"),
  label: trimmed(160).min(1, "Label is required"),
  detail: trimmed(300).nullable().optional(),
  quantity: z.number().int().min(1).max(9999).default(1),
  unitCents: z.number().int().min(-100_000_00).max(100_000_00),
  position: z.number().int().min(0).max(999).default(0),
});

export const updateQuoteLineSchema = z.object({
  id: z.string().uuid(),
  values: quoteLineInputSchema.omit({ quoteId: true }).partial(),
});

export const quoteSettingsSchema = z.object({
  id: z.string().uuid(),
  values: z
    .object({
      status: quoteStatusSchema,
      quoteDate: isoDate,
      validUntil: isoDate.nullable(),
      depositPercent: z.number().int().min(0).max(100),
      notes: trimmed(2000).nullable(),
      terms: trimmed(2000).nullable(),
      internalNotes: trimmed(2000).nullable(),
    })
    .partial(),
});

export const quoteNoteInputSchema = z.object({
  quoteId: z.string().uuid(),
  body: trimmed(2000).min(1, "Note is required"),
});

export const idSchema = z.object({ id: z.string().uuid() });

export type ListQuotesInput = z.input<typeof listQuotesSchema>;
export type GenerateQuoteInput = z.input<typeof generateQuoteSchema>;
export type QuoteLineInput = z.input<typeof quoteLineInputSchema>;
export type QuoteSettingsInput = z.input<typeof quoteSettingsSchema>;
