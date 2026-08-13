import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  fetchAllTemplates,
  fetchPublicTemplates,
  fetchTemplateBySlug,
  patchTemplate,
  swapTemplateOrder,
  updateTemplate,
  type TemplateInput,
} from "../api";
import { cakeTemplateKeys, type CakeTemplate } from "../types";

/**
 * Cake Templates — client access.
 *
 * Public and admin reads are separate cache entries because they answer
 * different questions ("what may a customer see" vs "what exists").
 */

export function usePublicTemplates() {
  return useQuery({
    queryKey: cakeTemplateKeys.public,
    queryFn: fetchPublicTemplates,
  });
}

/** Featured subset — shares the public cache, never a second request. */
export function useFeaturedTemplates(limit = 6) {
  return useQuery({
    queryKey: cakeTemplateKeys.public,
    queryFn: fetchPublicTemplates,
    select: (templates) => templates.filter((t) => t.isFeatured).slice(0, limit),
  });
}

export function useCakeTemplate(slug: string | null | undefined) {
  return useQuery({
    queryKey: cakeTemplateKeys.detail(slug ?? ""),
    queryFn: () => fetchTemplateBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useAdminTemplates() {
  return useQuery({
    queryKey: cakeTemplateKeys.admin,
    queryFn: fetchAllTemplates,
  });
}

export function useTemplateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: cakeTemplateKeys.all });

  return {
    create: useMutation({
      mutationFn: (input: TemplateInput) => createTemplate(input),
      onSuccess: () => {
        invalidate();
        toast.success("Template created");
      },
      onError: (e: Error) => toast.error(e.message || "Could not create the template"),
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: TemplateInput }) =>
        updateTemplate(id, input),
      onSuccess: () => {
        invalidate();
        toast.success("Template saved");
      },
      onError: (e: Error) => toast.error(e.message || "Could not save the template"),
    }),
    patch: useMutation({
      mutationFn: ({
        id,
        patch,
      }: {
        id: string;
        patch: Parameters<typeof patchTemplate>[1];
      }) => patchTemplate(id, patch),
      onSuccess: invalidate,
      onError: () => toast.error("Update failed"),
    }),
    duplicate: useMutation({
      mutationFn: (template: CakeTemplate) => duplicateTemplate(template),
      onSuccess: () => {
        invalidate();
        toast.success("Template duplicated — the copy is hidden until you activate it");
      },
      onError: () => toast.error("Duplicate failed"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteTemplate(id),
      onSuccess: () => {
        invalidate();
        toast.success("Template deleted");
      },
      onError: () => toast.error("Delete failed"),
    }),
    reorder: useMutation({
      mutationFn: ({ a, b }: { a: CakeTemplate; b: CakeTemplate }) => swapTemplateOrder(a, b),
      onSuccess: invalidate,
      onError: () => toast.error("Reorder failed"),
    }),
  };
}
