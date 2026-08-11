import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  fetchGalleryPhotos,
  swapGalleryPhotoOrder,
} from "../api";
import { galleryKeys, type GalleryPhoto } from "../types";

/** Single read path for gallery photos — shared by public and admin views. */
export function useGalleryPhotos() {
  return useQuery({
    queryKey: galleryKeys.all,
    queryFn: fetchGalleryPhotos,
  });
}

/**
 * Curated homepage subset — the first `limit` photos in the order Sonja set in
 * the admin gallery. Shares the cache with the full gallery read, so the
 * homepage never introduces a second source of truth or a second request.
 */
export function useFeaturedGalleryPhotos(limit = 12) {
  return useQuery({
    queryKey: galleryKeys.all,
    queryFn: fetchGalleryPhotos,
    select: (photos) => photos.slice(0, limit),
  });
}


export function useGalleryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: galleryKeys.all });

  const upload = useMutation({
    mutationFn: createGalleryPhoto,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: ({ a, b }: { a: GalleryPhoto; b: GalleryPhoto }) =>
      swapGalleryPhotoOrder(a, b),
    onSuccess: invalidate,
  });

  return { upload, remove, reorder };
}
