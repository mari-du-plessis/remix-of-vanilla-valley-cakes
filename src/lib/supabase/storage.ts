import { supabase } from "@/integrations/supabase/client";

/** Storage buckets used by the app. */
export const BUCKETS = {
  gallery: "gallery-photos",
  inspiration: "inspiration-photos",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Public URL for an object in a public bucket. */
export function bucketPublicUrl(bucket: BucketName, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Collision-safe object name preserving the original extension. */
export function generateObjectName(file: File, forcedExt?: string): string {
  const ext = forcedExt ?? file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export type UploadResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

/** Upload a file to a bucket and return its path + public URL. */
export async function uploadToBucket(
  bucket: BucketName,
  file: File,
): Promise<UploadResult> {
  const path = generateObjectName(
    file,
    file.type === "image/jpeg" ? "jpg" : undefined,
  );
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error(`[storage] upload to ${bucket} failed`, error);
    return { ok: false, error: error.message };
  }
  return { ok: true, path, publicUrl: bucketPublicUrl(bucket, path) };
}

export async function removeFromBucket(bucket: BucketName, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}
