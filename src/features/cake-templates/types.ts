import type { SavedDesignSnapshot } from "@/features/saved-designs/types";

/**
 * Cake Templates — domain types.
 *
 * A template is a *bakery-owned* starting design: the same structured cake
 * configuration the builder, the AI concept and the order payload already
 * consume, curated by Vanilla Valley rather than by a customer.
 *
 *   Gallery       — photographs of real work.
 *   Template      — Vanilla Valley owned starting configuration (this module).
 *   Saved Design  — customer owned configuration.
 *
 * All three end in the same Custom Cake Builder and the same order flow.
 *
 * The configuration is the source of truth. Previews are re-rendered from it
 * through the shared SVG renderer and the shared asset library, so a template
 * created today automatically improves when the artwork does. Any stored AI
 * concept is an artistic representation only.
 */

/** Structured configuration — identical in shape to a saved design snapshot. */
export type CakeTemplateDesign = SavedDesignSnapshot;

/** How a template travels with a customer's working design and their enquiry. */
export type TemplateReference = {
  id: string;
  slug: string;
  name: string;
};

export type CakeTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  /**
   * Product family the template belongs to. Only `custom-cake` is offered
   * today; the column exists so other families can adopt templates later
   * without a migration.
   */
  productSlug: string;
  sizeKey: string | null;
  tierCount: number;
  design: CakeTemplateDesign;
  galleryPhotoId: string | null;
  inspirationImageUrl: string | null;
  /** Optional AI concept — a representation, never the source of truth. */
  aiPreviewUrl: string | null;
  /** Fingerprint of the configuration the concept was drawn from. */
  aiPreviewSignature: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

/** Templates currently only exist for the Custom Cake family. */
export const TEMPLATE_PRODUCT_SLUG = "custom-cake";

export const CAKE_TEMPLATE_COLUMNS =
  "id, slug, name, description, category, product_slug, size_key, tier_count, design, gallery_photo_id, inspiration_image_url, ai_preview_url, ai_preview_signature, is_featured, is_active, sort_order, status, created_at, updated_at" as const;

export const cakeTemplateKeys = {
  all: ["cake-templates"] as const,
  public: ["cake-templates", "public"] as const,
  admin: ["cake-templates", "admin"] as const,
  detail: (slug: string) => ["cake-templates", "detail", slug] as const,
};

export const templateReference = (template: CakeTemplate): TemplateReference => ({
  id: template.id,
  slug: template.slug,
  name: template.name,
});
