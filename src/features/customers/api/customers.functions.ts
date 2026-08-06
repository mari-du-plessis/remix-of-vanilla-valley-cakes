import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  addressInputSchema,
  customerIdSchema,
  customerInputSchema,
  idSchema,
  listCustomersSchema,
  noteInputSchema,
  updateAddressSchema,
  updateCustomerSchema,
} from "./schema";
import {
  deleteRow,
  fetchCustomerDetail,
  fetchCustomerTags,
  fetchCustomers,
  insertAddress,
  insertCustomer,
  insertNote,
  updateAddressRow,
  updateCustomerRow,
} from "./customers.server";
import type { Customer, CustomerDetail } from "../types";

/**
 * Customer records are staff-only: every function is admin-authenticated and
 * RLS enforces the same rule at the database. The public order wizard keeps
 * writing customers through the existing anonymous order flow — unchanged.
 */

export const listCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listCustomersSchema.parse(data))
  .handler(
    async ({ data, context }): Promise<Customer[]> => fetchCustomers(context.supabase, data),
  );

export const getCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => customerIdSchema.parse(data))
  .handler(
    async ({ data, context }): Promise<CustomerDetail> =>
      fetchCustomerDetail(context.supabase, data.customerId),
  );

export const listCustomerTags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => fetchCustomerTags(context.supabase));

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => customerInputSchema.parse(data))
  .handler(async ({ data, context }) => insertCustomer(context.supabase, data));

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateCustomerSchema.parse(data))
  .handler(async ({ data, context }) => updateCustomerRow(context.supabase, data.id, data.values));

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => deleteRow(context.supabase, "customers", data.id));

export const createCustomerAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => addressInputSchema.parse(data))
  .handler(async ({ data, context }) => insertAddress(context.supabase, data));

export const updateCustomerAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateAddressSchema.parse(data))
  .handler(async ({ data, context }) => updateAddressRow(context.supabase, data.id, data.values));

export const deleteCustomerAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => deleteRow(context.supabase, "customer_addresses", data.id));

export const createCustomerNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => noteInputSchema.parse(data))
  .handler(async ({ data, context }) => insertNote(context.supabase, data.customerId, data.body));

export const deleteCustomerNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => deleteRow(context.supabase, "customer_notes", data.id));
