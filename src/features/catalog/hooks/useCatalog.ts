import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOptionRule,
  deleteCategory,
  deleteOption,
  deleteOptionGroup,
  deleteOptionRule,
  deleteProduct,
  fetchAllOptions,
  fetchCategories,
  fetchOptionGroups,
  fetchOptionRules,
  fetchProductOptionGroups,
  fetchProducts,
  saveCategory,
  saveOption,
  saveOptionGroup,
  saveProduct,
  setProductOptionGroup,
} from "../api";
import { catalogKeys } from "../types";

/**
 * Admin-facing catalog hooks. Every mutation invalidates the whole catalog
 * namespace so the public wizard picks up changes on its next read.
 */
function useCatalogMutation<TInput>(
  fn: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export const useCategories = () =>
  useQuery({ queryKey: catalogKeys.categories, queryFn: fetchCategories });

export const useProducts = () =>
  useQuery({ queryKey: catalogKeys.products, queryFn: fetchProducts });

export const useOptionGroups = () =>
  useQuery({ queryKey: catalogKeys.groups, queryFn: fetchOptionGroups });

export const useAllOptions = () =>
  useQuery({ queryKey: [...catalogKeys.all, "options"], queryFn: fetchAllOptions });

export const useOptionRules = () =>
  useQuery({ queryKey: catalogKeys.rules, queryFn: fetchOptionRules });

export const useProductOptionGroups = (productId: string | null) =>
  useQuery({
    queryKey: catalogKeys.productGroups(productId ?? "none"),
    queryFn: () => fetchProductOptionGroups(productId as string),
    enabled: !!productId,
  });

export const useSaveCategory = () => useCatalogMutation(saveCategory, "Category saved");
export const useDeleteCategory = () => useCatalogMutation(deleteCategory, "Category deleted");
export const useSaveProduct = () => useCatalogMutation(saveProduct, "Product saved");
export const useDeleteProduct = () => useCatalogMutation(deleteProduct, "Product deleted");
export const useSaveOptionGroup = () =>
  useCatalogMutation(saveOptionGroup, "Option group saved");
export const useDeleteOptionGroup = () =>
  useCatalogMutation(deleteOptionGroup, "Option group deleted");
export const useSaveOption = () => useCatalogMutation(saveOption, "Option saved");
export const useDeleteOption = () => useCatalogMutation(deleteOption, "Option deleted");
export const useCreateOptionRule = () => useCatalogMutation(createOptionRule, "Rule added");
export const useDeleteOptionRule = () => useCatalogMutation(deleteOptionRule, "Rule removed");
export const useSetProductOptionGroup = () =>
  useCatalogMutation(setProductOptionGroup, "Product options updated");
