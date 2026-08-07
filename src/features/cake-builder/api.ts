import { supabase } from "@/integrations/supabase/client";
import {
  CAKE_ASSET_COLUMNS,
  CAKE_ASSET_LINK_COLUMNS,
  type CakeAsset,
  type CakeAssetOptionLink,
} from "./types";

/**
 * Asset library data access. Reads are public (RLS exposes active assets only
 * to visitors) so the customer preview and the admin library share one module.
 * Writes are admin-only and enforced by RLS.
 */

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }): T => {
  if (error) throw error;
  return (data ?? []) as T;
};

const run = async (promise: PromiseLike<{ error: unknown }>) => {
  const { error } = await promise;
  if (error) throw error;
};

export async function fetchCakeAssets(): Promise<CakeAsset[]> {
  return unwrap(
    await supabase
      .from("cake_builder_assets")
      .select(CAKE_ASSET_COLUMNS)
      .order("category")
      .order("z_index")
      .order("name"),
  ) as CakeAsset[];
}

export async function fetchCakeAssetLinks(): Promise<CakeAssetOptionLink[]> {
  return unwrap(await supabase.from("cake_builder_asset_options").select(CAKE_ASSET_LINK_COLUMNS));
}

export type CakeAssetInput = Partial<Omit<CakeAsset, "id">> & { name: string; key: string };

export async function saveCakeAsset(input: CakeAssetInput & { id?: string }) {
  const payload = {
    key: input.key.trim(),
    name: input.name.trim(),
    category: input.category ?? "decoration",
    slot: input.slot ?? "cluster",
    svg_content: (input.svg_content ?? "").trim(),
    z_index: input.z_index ?? 0,
    is_active: input.is_active ?? true,
    notes: input.notes?.trim() || null,
    metadata: (input.metadata ?? {}) as never,
  };

  if (!input.id) {
    await run(supabase.from("cake_builder_assets").insert(payload));
    return;
  }

  /** Editing the artwork bumps the version so history stays legible. */
  await run(
    supabase
      .from("cake_builder_assets")
      .update({ ...payload, version: (input.version ?? 1) + 1 })
      .eq("id", input.id),
  );
}

export const deleteCakeAsset = (id: string) =>
  run(supabase.from("cake_builder_assets").delete().eq("id", id));

export async function setCakeAssetOption(input: {
  asset_id: string;
  option_id: string;
  enabled: boolean;
}) {
  if (!input.enabled) {
    await run(
      supabase
        .from("cake_builder_asset_options")
        .delete()
        .eq("asset_id", input.asset_id)
        .eq("option_id", input.option_id),
    );
    return;
  }
  await run(
    supabase
      .from("cake_builder_asset_options")
      .upsert(
        { asset_id: input.asset_id, option_id: input.option_id },
        { onConflict: "asset_id,option_id" },
      ),
  );
}
