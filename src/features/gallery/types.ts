import type { Tables } from "@/integrations/supabase/types";

/** Canonical gallery photo shape — shared by public gallery and admin. */
export type GalleryPhoto = Pick<
  Tables<"gallery_photos">,
  "id" | "image_path" | "caption" | "sort_order" | "category"
>;

export const GALLERY_PHOTO_COLUMNS = "id,image_path,caption,sort_order,category";

export const galleryKeys = {
  all: ["gallery-photos"] as const,
};
