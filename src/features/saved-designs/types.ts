import type { CakeAppearance } from "@/features/cake-builder/lib/appearance";
import type { GalleryInspiration } from "@/features/gallery/lib/inspiration-reference";
import type { CakeTier } from "@/features/order/types";
import type { TemplateReference } from "@/features/cake-templates/lib/reference";

/**
 * Saved Designs — domain types.
 *
 * A saved design is a *structured configuration*, never a picture: the same
 * shape the cake builder, the AI concept prompt and the order payload already
 * consume. Storing the configuration (rather than a rendered image) means a
 * design saved today still renders correctly after the asset library, the
 * renderer or the catalog evolve.
 *
 * Ownership is deliberately indirect. Anonymous customers own their designs
 * through an opaque `ownerKey` held in their browser; the column
 * `customer_id` / `profile_id` on the table is the seam for real customer
 * accounts later, so no migration is needed when accounts ship.
 */

/** The persisted cake configuration. Contact and logistics data never enter. */
export type SavedDesignSnapshot = {
  occasion: string;
  product: string;
  shapeKey: string;
  icingKey: string;
  size: string;
  flavour: string;
  filling: string;
  tiers: CakeTier[];
  extras: string[];
  appearance: CakeAppearance;
  cakeText: string;
  /** A Vanilla Valley gallery photo the customer picked as a reference. */
  galleryInspiration: GalleryInspiration | null;
  /** The Vanilla Valley template this design started from, when any. */
  templateRef: TemplateReference | null;
  /** The customer's own uploaded reference, already in storage. */
  inspirationImageUrl: string;
};

export type SavedDesign = {
  id: string;
  name: string;
  productSlug: string | null;
  sizeKey: string | null;
  tierCount: number;
  design: SavedDesignSnapshot;
  galleryPhotoId: string | null;
  inspirationImageUrl: string | null;
  /** AI concept preserved with the design so it is never regenerated blindly. */
  aiPreviewUrl: string | null;
  aiPreviewSignature: string | null;
  status: "active" | "archived";
  lastOpenedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const SAVED_DESIGN_COLUMNS =
  "id, name, product_slug, size_key, tier_count, design, gallery_photo_id, inspiration_image_url, ai_preview_url, ai_preview_signature, status, last_opened_at, created_at, updated_at" as const;

export const savedDesignKeys = {
  all: ["saved-designs"] as const,
  list: (ownerKey: string) => ["saved-designs", "list", ownerKey] as const,
  detail: (id: string) => ["saved-designs", "detail", id] as const,
};
