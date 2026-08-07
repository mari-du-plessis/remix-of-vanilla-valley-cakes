import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  attachOrderAiPreviewRecord,
  createOrderRecord,
  fetchOrder,
  fetchOrders,
  setOrderInternalNotes,
  setOrderStatus,
} from "./orders.server";
import {
  attachAiPreviewSchema,
  createAdminOrderSchema,
  createOrderSchema,
  listOrdersSchema,
  orderIdSchema,
  updateOrderNotesSchema,
  updateOrderStatusSchema,
} from "./schema";

/** Public: turns a customer enquiry into a persistent order. */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => createOrderRecord({ ...data, status: "enquiry" }));

/**
 * Admin: capture an order taken on WhatsApp, the phone, Instagram or in person.
 * Unlike the public intake it may attach to an existing customer and open at
 * any status.
 */
export const createAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createAdminOrderSchema.parse(data))
  .handler(async ({ data }) => createOrderRecord(data));


/** Admin: list orders (RLS restricts rows to admins). */
export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listOrdersSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => fetchOrders(context.supabase, data));

/** Admin: full order detail with items, options and status history. */
export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => orderIdSchema.parse(data))
  .handler(async ({ data, context }) => fetchOrder(context.supabase, data.orderId));

/** Admin: move an order through its lifecycle (history is written by trigger). */
export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateOrderStatusSchema.parse(data))
  .handler(async ({ data, context }) =>
    setOrderStatus(context.supabase, data.orderId, data.status),
  );

/** Admin: private notes never shown to the customer. */
export const updateOrderNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateOrderNotesSchema.parse(data))
  .handler(async ({ data, context }) =>
    setOrderInternalNotes(context.supabase, data.orderId, data.internalNotes),
  );

/**
 * Public: the customer wizard generates its AI concept in the background, so
 * a concept that finishes after the order is saved is attached here.
 */
export const attachOrderAiPreview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => attachAiPreviewSchema.parse(data))
  .handler(async ({ data }) => attachOrderAiPreviewRecord(data.orderId, data.aiPreviewUrl));
