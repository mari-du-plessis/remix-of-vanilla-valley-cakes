import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCakeAsset, saveCakeAsset, setCakeAssetOption } from "../api";
import { cakeBuilderKeys } from "../types";

/**
 * Admin mutations for the asset library. Every write invalidates the whole
 * cake-builder namespace so the customer preview picks the artwork up on its
 * next read — no extra plumbing when new asset types are added.
 */
function useAssetMutation<TInput>(fn: (input: TInput) => Promise<unknown>, message: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cakeBuilderKeys.all });
      toast.success(message);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export const useSaveCakeAsset = () => useAssetMutation(saveCakeAsset, "Asset saved");
export const useDeleteCakeAsset = () => useAssetMutation(deleteCakeAsset, "Asset deleted");
export const useSetCakeAssetOption = () =>
  useAssetMutation(setCakeAssetOption, "Option mapping updated");
