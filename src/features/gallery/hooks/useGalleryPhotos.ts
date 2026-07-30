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
