import { z } from "zod";

/** Validation contracts for the customers module (client + server safe). */

const trimmed = (max: number) => z.string().trim().max(max);

export const customerStatusSchema = z.enum([
  "lead",
  "active",
  "vip",
  "inactive",
  "blocked",
]);

export const contactChannelSchema = z.enum(["whatsapp", "phone", "email", "instagram"]);

export const customerSortSchema = z.enum(["recent", "name", "orders", "last_order"]);

export const idSchema = z.object({ id: z.string().uuid() });
export const customerIdSchema = z.object({ customerId: z.string().uuid() });

export const listCustomersSchema = z.object({
  search: trimmed(100).optional().default(""),
  status: z.union([customerStatusSchema, z.literal("all")]).default("all"),
  tag: trimmed(40).nullable().optional().default(null),
  sort: customerSortSchema.default("recent"),
  limit: z.number().int().min(1).max(500).default(200),
});

export const customerInputSchema = z.object({
  name: trimmed(120).min(1, "Name is required"),
  phone: trimmed(30).min(5, "Phone number is required"),
  whatsappPhone: trimmed(30).nullable().optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).nullable().optional(),
  status: customerStatusSchema.default("lead"),
  preferredChannel: contactChannelSchema.default("whatsapp"),
  tags: z.array(trimmed(40)).max(20).default([]),
  notes: trimmed(4000).nullable().optional(),
  marketingOptIn: z.boolean().default(false),
});

export const updateCustomerSchema = z.object({
  id: z.string().uuid(),
  values: customerInputSchema.partial(),
});

export const addressInputSchema = z.object({
  customerId: z.string().uuid(),
  label: trimmed(60).default("Delivery"),
  recipientName: trimmed(120).nullable().optional(),
  phone: trimmed(30).nullable().optional(),
  line1: trimmed(160).min(1, "Street address is required"),
  line2: trimmed(160).nullable().optional(),
  suburb: trimmed(80).nullable().optional(),
  city: trimmed(80).nullable().optional(),
  province: trimmed(80).nullable().optional(),
  postalCode: trimmed(20).nullable().optional(),
  country: trimmed(80).default("South Africa"),
  deliveryNotes: trimmed(500).nullable().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  id: z.string().uuid(),
  values: addressInputSchema.partial().omit({ customerId: true }),
});

export const noteInputSchema = z.object({
  customerId: z.string().uuid(),
  body: trimmed(4000).min(1, "Note cannot be empty"),
});

export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
export type CustomerInput = z.infer<typeof customerInputSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type NoteInput = z.infer<typeof noteInputSchema>;
