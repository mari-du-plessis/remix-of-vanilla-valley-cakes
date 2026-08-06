import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  deleteQuoteLine,
  deleteQuoteRow,
  fetchQuote,
  fetchQuotes,
  generateQuote,
  insertQuoteLine,
  insertQuoteNote,
  updateQuoteLine,
  updateQuoteSettings,
} from "./quotes.server";
import {
  generateQuoteSchema,
  idSchema,
  listQuotesSchema,
  quoteIdSchema,
  quoteLineInputSchema,
  quoteNoteInputSchema,
  quoteSettingsSchema,
  updateQuoteLineSchema,
} from "./schema";

/** Quotes are internal commercial documents — every function is admin-only. */

export const listQuotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listQuotesSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => fetchQuotes(context.supabase, data));

export const getQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteIdSchema.parse(data))
  .handler(async ({ data, context }) => fetchQuote(context.supabase, data.quoteId));

/** Runs the pricing engine over the order and stores the resulting draft. */
export const createQuoteFromOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => generateQuoteSchema.parse(data))
  .handler(async ({ data, context }) => generateQuote(context.supabase, data, context.userId));

export const addQuoteLine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteLineInputSchema.parse(data))
  .handler(async ({ data, context }) => insertQuoteLine(context.supabase, data));

export const editQuoteLine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateQuoteLineSchema.parse(data))
  .handler(async ({ data, context }) => updateQuoteLine(context.supabase, data.id, data.values));

export const removeQuoteLine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => deleteQuoteLine(context.supabase, data.id));

export const saveQuoteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteSettingsSchema.parse(data))
  .handler(async ({ data, context }) =>
    updateQuoteSettings(context.supabase, data.id, data.values),
  );

export const addQuoteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => quoteNoteInputSchema.parse(data))
  .handler(async ({ data, context }) => insertQuoteNote(context.supabase, data, context.userId));

export const deleteQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => deleteQuoteRow(context.supabase, data.id));
