import { supabase } from "@/integrations/supabase/client";
import { BUCKETS, removeFromBucket, uploadToBucket } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/media/compress-image";
import { GALLERY_PHOTO_COLUMNS, type GalleryPhoto } from "./types";

export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select(GALLERY_PHOTO_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGalleryPhoto(input: {
  file: File;
  caption: string;
  category: string;
  nextSortOrder: number;
}) {
  const compressed = await compressImage(input.file);
  const upload = await uploadToBucket(BUCKETS.gallery, compressed);
  if (!upload.ok) throw new Error(upload.error);

  const { error } = await supabase.from("gallery_photos").insert({
    image_path: upload.path,
    caption: input.caption.trim() || null,
    category: input.category,
    sort_order: input.nextSortOrder,
  });
  if (error) throw error;
}

export async function deleteGalleryPhoto(photo: GalleryPhoto) {
  await removeFromBucket(BUCKETS.gallery, photo.image_path);
  const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
  if (error) throw error;
}

/** Swap the sort_order of two photos. */
export async function swapGalleryPhotoOrder(a: GalleryPhoto, b: GalleryPhoto) {
  await supabase.from("gallery_photos").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("gallery_photos").update({ sort_order: a.sort_order }).eq("id", b.id);
}
