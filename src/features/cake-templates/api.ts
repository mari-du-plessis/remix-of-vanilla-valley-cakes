import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { uniqueSlug } from "@/features/catalog/lib/slug";
import {
  CAKE_TEMPLATE_COLUMNS,
  TEMPLATE_PRODUCT_SLUG,
  type CakeTemplate,
  type CakeTemplateDesign,
} from "./types";

/**
 * Cake Templates — data access.
 *
 * Reads and writes go through the ordinary Data API client, exactly like the
 * gallery: RLS is the security boundary. The public policy exposes active,
 * non-archived templates only; every write requires the admin role, so no
 * customer surface can reach a draft or modify a template.
 */

type Row = Record<string, unknown>;

const mapRow = (row: Row): CakeTemplate => ({
  id: row["id"] as string,
  slug: row["slug"] as string,
  name: row["name"] as string,
  description: (row["description"] as string | null) ?? null,
  category: (row["category"] as string | null) ?? null,
  productSlug: (row["product_slug"] as string | null) ?? TEMPLATE_PRODUCT_SLUG,
  sizeKey: (row["size_key"] as string | null) ?? null,
  tierCount: (row["tier_count"] as number | null) ?? 1,
  design: (row["design"] ?? {}) as CakeTemplateDesign,
  galleryPhotoId: (row["gallery_photo_id"] as string | null) ?? null,
  inspirationImageUrl: (row["inspiration_image_url"] as string | null) ?? null,
  aiPreviewUrl: (row["ai_preview_url"] as string | null) ?? null,
  aiPreviewSignature: (row["ai_preview_signature"] as string | null) ?? null,
  isFeatured: !!row["is_featured"],
  isActive: !!row["is_active"],
  sortOrder: (row["sort_order"] as number | null) ?? 0,
  status: (row["status"] as CakeTemplate["status"]) ?? "active",
  createdAt: row["created_at"] as string,
  updatedAt: row["updated_at"] as string,
});

/** Everything a customer may see, in the order Sonja arranged. */
export async function fetchPublicTemplates(): Promise<CakeTemplate[]> {
  const { data, error } = await supabase
    .from("cake_templates")
    .select(CAKE_TEMPLATE_COLUMNS)
    .eq("is_active", true)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Row));
}

/** Admin view — includes inactive and archived templates. */
export async function fetchAllTemplates(): Promise<CakeTemplate[]> {
  const { data, error } = await supabase
    .from("cake_templates")
    .select(CAKE_TEMPLATE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Row));
}

/** Public detail read; RLS hides anything not published. */
export async function fetchTemplateBySlug(slug: string): Promise<CakeTemplate | null> {
  const { data, error } = await supabase
    .from("cake_templates")
    .select(CAKE_TEMPLATE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export type TemplateInput = {
  name: string;
  description: string;
  category: string;
  design: CakeTemplateDesign;
  isFeatured: boolean;
  isActive: boolean;
  aiPreviewUrl?: string | null;
  aiPreviewSignature?: string | null;
};

const writePayload = (input: TemplateInput) => ({
  name: input.name.trim(),
  description: input.description.trim() || null,
  category: input.category || null,
  product_slug: TEMPLATE_PRODUCT_SLUG,
  size_key: input.design.size || null,
  tier_count: Math.max(1, input.design.tiers.length || 1),
  design: input.design as unknown as Json,
  gallery_photo_id: input.design.galleryInspiration?.id ?? null,
  inspiration_image_url: input.design.inspirationImageUrl || null,
  ai_preview_url: input.aiPreviewUrl || null,
  ai_preview_signature: input.aiPreviewSignature || null,
  is_featured: input.isFeatured,
  is_active: input.isActive,
});

const existingSlugs = async () => {
  const { data } = await supabase.from("cake_templates").select("slug");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
};

export async function createTemplate(input: TemplateInput): Promise<CakeTemplate> {
  const [slugs, { data: last }] = await Promise.all([
    existingSlugs(),
    supabase
      .from("cake_templates")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data, error } = await supabase
    .from("cake_templates")
    .insert({
      ...writePayload(input),
      slug: uniqueSlug(input.name, slugs),
      sort_order: ((last as { sort_order: number } | null)?.sort_order ?? 0) + 1,
    })
    .select(CAKE_TEMPLATE_COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data as Row);
}

export async function updateTemplate(
  id: string,
  input: TemplateInput,
): Promise<CakeTemplate> {
  const { data, error } = await supabase
    .from("cake_templates")
    .update(writePayload(input))
    .eq("id", id)
    .select(CAKE_TEMPLATE_COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data as Row);
}

/** Small flag changes (featured / active / archived) without touching design. */
export async function patchTemplate(
  id: string,
  patch: Partial<{ is_featured: boolean; is_active: boolean; status: "active" | "archived" }>,
): Promise<void> {
  const { error } = await supabase.from("cake_templates").update(patch).eq("id", id);
  if (error) throw error;
}

/**
 * Duplicating copies the *values* of the source template into a brand new,
 * independent record — the two never stay linked, so editing one can never
 * change the other.
 */
export async function duplicateTemplate(template: CakeTemplate): Promise<CakeTemplate> {
  return createTemplate({
    name: `${template.name} (copy)`,
    description: template.description ?? "",
    category: template.category ?? "",
    design: template.design,
    isFeatured: false,
    /* A copy starts hidden so it can be edited before customers see it. */
    isActive: false,
    aiPreviewUrl: template.aiPreviewUrl,
    aiPreviewSignature: template.aiPreviewSignature,
  });
}

/**
 * Deleting only ever removes the template row. Saved designs and orders that
 * started from it keep their own configuration; the database simply clears
 * their reference.
 */
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("cake_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function swapTemplateOrder(a: CakeTemplate, b: CakeTemplate): Promise<void> {
  await supabase.from("cake_templates").update({ sort_order: b.sortOrder }).eq("id", a.id);
  await supabase.from("cake_templates").update({ sort_order: a.sortOrder }).eq("id", b.id);
}
