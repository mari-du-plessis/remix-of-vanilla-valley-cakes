import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import type { SavedDesign, SavedDesignSnapshot } from "../types";
import { SAVED_DESIGN_COLUMNS } from "../types";
import type { z } from "zod";
import type {
  archiveSavedDesignSchema,
  listSavedDesignsSchema,
  renameSavedDesignSchema,
  saveDesignSchema,
  savedDesignIdSchema,
} from "./schema";

/**
 * Saved Designs — data access.
 *
 * Rows are invisible to the public Data API (RLS grants admins read access
 * only), so every customer-facing read and write happens here, through the
 * privileged client, and is *always* filtered by the caller's `owner_key`.
 * A customer can therefore never reach another customer's design, even with a
 * valid design id.
 */

type Row = Record<string, unknown>;

const mapRow = (row: Row): SavedDesign => ({
  id: row["id"] as string,
  name: row["name"] as string,
  productSlug: (row["product_slug"] as string | null) ?? null,
  sizeKey: (row["size_key"] as string | null) ?? null,
  tierCount: (row["tier_count"] as number | null) ?? 1,
  design: (row["design"] ?? {}) as SavedDesignSnapshot,
  galleryPhotoId: (row["gallery_photo_id"] as string | null) ?? null,
  inspirationImageUrl: (row["inspiration_image_url"] as string | null) ?? null,
  aiPreviewUrl: (row["ai_preview_url"] as string | null) ?? null,
  aiPreviewSignature: (row["ai_preview_signature"] as string | null) ?? null,
  status: (row["status"] as SavedDesign["status"]) ?? "active",
  lastOpenedAt: row["last_opened_at"] as string,
  createdAt: row["created_at"] as string,
  updatedAt: row["updated_at"] as string,
});

export async function fetchSavedDesigns(
  input: z.infer<typeof listSavedDesignsSchema>,
): Promise<SavedDesign[]> {
  let query = supabaseAdmin
    .from("saved_designs")
    .select(SAVED_DESIGN_COLUMNS)
    .eq("owner_key", input.ownerKey)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (input.status !== "all") query = query.eq("status", input.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Row));
}

export async function fetchSavedDesign(
  input: z.infer<typeof savedDesignIdSchema>,
): Promise<SavedDesign | null> {
  const { data, error } = await supabaseAdmin
    .from("saved_designs")
    .select(SAVED_DESIGN_COLUMNS)
    .eq("owner_key", input.ownerKey)
    .eq("id", input.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  /* Opening a design keeps the customer's list in a useful order. */
  await supabaseAdmin
    .from("saved_designs")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("owner_key", input.ownerKey)
    .eq("id", input.id);

  return mapRow(data as Row);
}

export async function upsertSavedDesign(
  input: z.infer<typeof saveDesignSchema>,
): Promise<SavedDesign> {
  const design = input.design;
  const payload = {
    owner_key: input.ownerKey,
    name: input.name,
    product_slug: design.product || null,
    size_key: design.size || null,
    tier_count: Math.max(1, design.tiers.length || 1),
    design: design as unknown as Json,
    gallery_photo_id: design.galleryInspiration?.id ?? null,
    inspiration_image_url: design.inspirationImageUrl || null,
    ai_preview_url: input.aiPreviewUrl || null,
    ai_preview_signature: input.aiPreviewSignature || null,
    source_order_id: input.sourceOrderId ?? null,
    status: "active" as const,
    last_opened_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabaseAdmin
      .from("saved_designs")
      .update(payload)
      .eq("owner_key", input.ownerKey)
      .eq("id", input.id)
      .select(SAVED_DESIGN_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return mapRow(data as Row);
    /* Unknown id for this device: fall through and save it as a new design. */
  }

  const { data, error } = await supabaseAdmin
    .from("saved_designs")
    .insert(payload)
    .select(SAVED_DESIGN_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function renameSavedDesignRow(
  input: z.infer<typeof renameSavedDesignSchema>,
): Promise<SavedDesign> {
  const { data, error } = await supabaseAdmin
    .from("saved_designs")
    .update({ name: input.name })
    .eq("owner_key", input.ownerKey)
    .eq("id", input.id)
    .select(SAVED_DESIGN_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function setSavedDesignStatus(
  input: z.infer<typeof archiveSavedDesignSchema>,
): Promise<SavedDesign> {
  const { data, error } = await supabaseAdmin
    .from("saved_designs")
    .update({ status: input.status })
    .eq("owner_key", input.ownerKey)
    .eq("id", input.id)
    .select(SAVED_DESIGN_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteSavedDesignRow(
  input: z.infer<typeof savedDesignIdSchema>,
): Promise<{ id: string }> {
  const { error } = await supabaseAdmin
    .from("saved_designs")
    .delete()
    .eq("owner_key", input.ownerKey)
    .eq("id", input.id);
  if (error) throw new Error(error.message);
  return { id: input.id };
}

/**
 * Admin visibility. Staff read designs through their own authenticated client,
 * so RLS (admin-only SELECT) — not this module — decides what they may see.
 */
export async function fetchAllSavedDesigns(
  client: { from: typeof supabaseAdmin.from },
  limit: number,
): Promise<SavedDesign[]> {
  const { data, error } = await client
    .from("saved_designs")
    .select(SAVED_DESIGN_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Row));
}
