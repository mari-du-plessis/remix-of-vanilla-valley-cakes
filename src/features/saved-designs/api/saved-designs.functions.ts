import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  archiveSavedDesignSchema,
  listSavedDesignsSchema,
  renameSavedDesignSchema,
  saveDesignSchema,
  savedDesignIdSchema,
} from "./schema";
import type { SavedDesign } from "../types";

/**
 * Saved Designs — server API.
 *
 * Customer-facing functions are unauthenticated (designs are saved long before
 * anyone signs in) but never unprotected: each one requires the browser's
 * opaque owner key and every query is filtered by it in `saved-designs.server`.
 */

export const listSavedDesigns = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => listSavedDesignsSchema.parse(data))
  .handler(async ({ data }): Promise<SavedDesign[]> => {
    const { fetchSavedDesigns } = await import("./saved-designs.server");
    return fetchSavedDesigns(data);
  });

export const getSavedDesign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => savedDesignIdSchema.parse(data))
  .handler(async ({ data }): Promise<SavedDesign | null> => {
    const { fetchSavedDesign } = await import("./saved-designs.server");
    return fetchSavedDesign(data);
  });

/** Create, or update when an id from this device is supplied. */
export const saveDesign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveDesignSchema.parse(data))
  .handler(async ({ data }): Promise<SavedDesign> => {
    const { upsertSavedDesign } = await import("./saved-designs.server");
    return upsertSavedDesign(data);
  });

export const renameSavedDesign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => renameSavedDesignSchema.parse(data))
  .handler(async ({ data }): Promise<SavedDesign> => {
    const { renameSavedDesignRow } = await import("./saved-designs.server");
    return renameSavedDesignRow(data);
  });

export const setSavedDesignArchived = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => archiveSavedDesignSchema.parse(data))
  .handler(async ({ data }): Promise<SavedDesign> => {
    const { setSavedDesignStatus } = await import("./saved-designs.server");
    return setSavedDesignStatus(data);
  });

export const deleteSavedDesign = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => savedDesignIdSchema.parse(data))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const { deleteSavedDesignRow } = await import("./saved-designs.server");
    return deleteSavedDesignRow(data);
  });

/** Admin visibility prep: staff read every design through their own client. */
export const listAllSavedDesigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedDesign[]> => {
    const { fetchAllSavedDesigns } = await import("./saved-designs.server");
    return fetchAllSavedDesigns(context.supabase as never, 200);
  });
