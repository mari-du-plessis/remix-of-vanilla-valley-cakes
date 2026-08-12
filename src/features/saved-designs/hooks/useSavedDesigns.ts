import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { OrderFormState } from "@/features/order/types";
import {
  deleteSavedDesign,
  getSavedDesign,
  listSavedDesigns,
  renameSavedDesign,
  saveDesign,
  setSavedDesignArchived,
} from "../api/saved-designs.functions";
import { getOwnerKey } from "../lib/owner-key";
import { designSignature, toSnapshot } from "../lib/snapshot";
import { savedDesignKeys, type SavedDesign } from "../types";

/**
 * Saved Designs — client access.
 *
 * The owner key is resolved in the browser only (localStorage), so every hook
 * waits for hydration before it queries.
 */

export function useOwnerKey() {
  const [ownerKey, setOwnerKey] = useState("");
  useEffect(() => setOwnerKey(getOwnerKey()), []);
  return ownerKey;
}

export function useSavedDesigns(status: "active" | "archived" | "all" = "active") {
  const ownerKey = useOwnerKey();
  const list = useServerFn(listSavedDesigns);

  const query = useQuery({
    queryKey: [...savedDesignKeys.list(ownerKey), status],
    queryFn: () => list({ data: { ownerKey, status } }),
    enabled: !!ownerKey,
  });

  return { ...query, ownerKey };
}

export function useSavedDesign(id: string | null) {
  const ownerKey = useOwnerKey();
  const get = useServerFn(getSavedDesign);

  return useQuery({
    queryKey: savedDesignKeys.detail(id ?? ""),
    queryFn: () => get({ data: { ownerKey, id: id as string } }),
    enabled: !!ownerKey && !!id,
  });
}

/** Save (or update) the design currently on screen. */
export function useSaveDesign() {
  const ownerKey = useOwnerKey();
  const queryClient = useQueryClient();
  const save = useServerFn(saveDesign);

  const mutation = useMutation({
    mutationFn: (input: {
      id?: string | null;
      name: string;
      form: OrderFormState;
      inspirationImageUrl?: string;
    }) => {
      const snapshot = toSnapshot(input.form, input.inspirationImageUrl ?? "");
      return save({
        data: {
          ownerKey,
          id: input.id ?? null,
          name: input.name,
          design: snapshot,
          /* The concept is preserved with the design, together with the
             fingerprint of the configuration it was drawn from. */
          aiPreviewUrl: input.form.aiPreviewUrl || null,
          aiPreviewSignature: input.form.aiPreviewUrl ? designSignature(snapshot) : null,
        },
      });
    },
    onSuccess: (design: SavedDesign) => {
      queryClient.invalidateQueries({ queryKey: savedDesignKeys.all });
      toast.success(`"${design.name}" saved to your designs`);
    },
    onError: () => toast.error("We couldn't save your design — please try again"),
  });

  return { ...mutation, canSave: !!ownerKey };
}

export function useSavedDesignActions() {
  const ownerKey = useOwnerKey();
  const queryClient = useQueryClient();
  const rename = useServerFn(renameSavedDesign);
  const archive = useServerFn(setSavedDesignArchived);
  const remove = useServerFn(deleteSavedDesign);

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: savedDesignKeys.all }),
    [queryClient],
  );

  return {
    rename: useMutation({
      mutationFn: (input: { id: string; name: string }) => rename({ data: { ownerKey, ...input } }),
      onSuccess: invalidate,
      onError: () => toast.error("Rename failed"),
    }),
    archive: useMutation({
      mutationFn: (input: { id: string; status: "active" | "archived" }) =>
        archive({ data: { ownerKey, ...input } }),
      onSuccess: invalidate,
      onError: () => toast.error("Update failed"),
    }),
    remove: useMutation({
      mutationFn: (id: string) => remove({ data: { ownerKey, id } }),
      onSuccess: () => {
        invalidate();
        toast.success("Design deleted");
      },
      onError: () => toast.error("Delete failed"),
    }),
  };
}
