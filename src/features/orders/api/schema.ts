import { z } from "zod";

/**
 * Validation contracts shared by the client and the server functions.
 * Kept free of any Supabase import so it is safe in both bundles.
 */

const trimmed = (max: number) => z.string().trim().max(max);

export const orderStatusSchema = z.enum([
  "enquiry",
  "quoted",
  "confirmed",
  "in_production",
  "ready",
  "completed",
  "cancelled",
]);

export const orderChannelSchema = z.enum([
  "website",
  "whatsapp",
  "phone",
  "instagram",
  "walk_in",
]);

export const orderOptionSchema = z.object({
  groupKey: trimmed(50).min(1),
  groupLabel: trimmed(80).min(1),
  valueKey: trimmed(80).optional(),
  valueLabel: trimmed(160).min(1),
  tierIndex: z.number().int().min(0).max(20).nullable().optional(),
});

export const orderItemSchema = z.object({
  name: trimmed(120).min(1),
  description: trimmed(500).optional(),
  sizeId: trimmed(50).optional(),
  sizeLabel: trimmed(120).optional(),
  quantity: z.number().int().min(1).max(999).default(1),
  options: z.array(orderOptionSchema).max(60).default([]),
});

/**
 * Public intake (the customer wizard). Deliberately cannot set a status, an
 * existing customer id or internal notes — those are admin-only concerns.
 */
export const createOrderSchema = z.object({
  customer: z.object({
    name: trimmed(100).min(1, "Name is required"),
    phone: trimmed(30).min(6, "A valid phone number is required"),
    email: z.union([z.string().trim().email().max(255), z.literal("")]).optional(),
  }),
  channel: orderChannelSchema.default("website"),
  occasion: trimmed(100).optional(),
  eventDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
    .optional(),
  customerNotes: trimmed(2000).optional(),
  inspirationUrl: z.union([z.string().url().max(1000), z.literal("")]).optional(),
  summary: trimmed(4000).optional(),
  items: z.array(orderItemSchema).min(1).max(20),
});

/** Admin capture: WhatsApp, phone, Instagram and walk-in orders. */
export const createAdminOrderSchema = createOrderSchema.extend({
  /** Set when the admin picks an existing customer instead of capturing one. */
  customerId: z.string().uuid().optional(),
  status: orderStatusSchema.default("enquiry"),
  internalNotes: trimmed(4000).optional(),
});




export const listOrdersSchema = z.object({
  status: z.union([orderStatusSchema, z.literal("all")]).default("all"),
  search: trimmed(100).optional(),
  limit: z.number().int().min(1).max(200).default(100),
});

export const orderIdSchema = z.object({ orderId: z.string().uuid() });

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: orderStatusSchema,
});

export const updateOrderNotesSchema = z.object({
  orderId: z.string().uuid(),
  internalNotes: trimmed(4000),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type ListOrdersInput = z.input<typeof listOrdersSchema>;
