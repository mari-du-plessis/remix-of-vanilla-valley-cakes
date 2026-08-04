import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_COLUMNS,
  OPTION_COLUMNS,
  OPTION_GROUP_COLUMNS,
  OPTION_RULE_COLUMNS,
  PRODUCT_COLUMNS,
  PRODUCT_OPTION_GROUP_COLUMNS,
  type CatalogOption,
  type OptionGroup,
  type OptionRule,
  type Product,
  type ProductCategory,
  type ProductOptionGroupLink,
} from "./types";

/**
 * Catalog data access. Reads run as the visitor (public policies expose only
 * active rows); writes are admin-only and enforced by RLS, so the same module
 * safely serves the public wizard and the admin managers.
 */

const unwrap = <T>({ data, error }: { data: T | null; error: unknown }): T => {
  if (error) throw error;
  return (data ?? []) as T;
};

/* ---------------------------------- reads --------------------------------- */

export async function fetchCategories(): Promise<ProductCategory[]> {
  return unwrap(
    await supabase
      .from("product_categories")
      .select(CATEGORY_COLUMNS)
      .order("sort_order")
      .order("name"),
  );
}

export async function fetchProducts(): Promise<Product[]> {
  return unwrap(
    await supabase.from("products").select(PRODUCT_COLUMNS).order("sort_order").order("name"),
  );
}

export async function fetchOptionGroups(): Promise<OptionGroup[]> {
  return unwrap(
    await supabase
      .from("option_groups")
      .select(OPTION_GROUP_COLUMNS)
      .order("sort_order")
      .order("name"),
  );
}

export async function fetchOptions(groupId: string): Promise<CatalogOption[]> {
  return unwrap(
    await supabase
      .from("options")
      .select(OPTION_COLUMNS)
      .eq("group_id", groupId)
      .order("sort_order")
      .order("name"),
  ) as CatalogOption[];
}

export async function fetchAllOptions(): Promise<CatalogOption[]> {
  return unwrap(
    await supabase.from("options").select(OPTION_COLUMNS).order("sort_order").order("name"),
  ) as CatalogOption[];
}

export async function fetchOptionRules(): Promise<OptionRule[]> {
  return unwrap(await supabase.from("option_rules").select(OPTION_RULE_COLUMNS));
}

export async function fetchProductOptionGroups(
  productId: string,
): Promise<ProductOptionGroupLink[]> {
  return unwrap(
    await supabase
      .from("product_option_groups")
      .select(PRODUCT_OPTION_GROUP_COLUMNS)
      .eq("product_id", productId)
      .order("sort_order"),
  );
}

/* --------------------------------- writes --------------------------------- */

const run = async (promise: PromiseLike<{ error: unknown }>) => {
  const { error } = await promise;
  if (error) throw error;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;

export type CategoryInput = Partial<Omit<ProductCategory, "id">> & { name: string };

export async function saveCategory(input: CategoryInput & { id?: string }) {
  const payload = {
    name: input.name.trim(),
    slug: input.slug?.trim() || slugify(input.name),
    description: input.description?.trim() || null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  };
  await run(
    input.id
      ? supabase.from("product_categories").update(payload).eq("id", input.id)
      : supabase.from("product_categories").insert(payload),
  );
}

export const deleteCategory = (id: string) =>
  run(supabase.from("product_categories").delete().eq("id", id));

export type ProductInput = Partial<Omit<Product, "id">> & { name: string };

export async function saveProduct(input: ProductInput & { id?: string }) {
  const payload = {
    name: input.name.trim(),
    slug: input.slug?.trim() || slugify(input.name),
    description: input.description?.trim() || null,
    category_id: input.category_id || null,
    kind: input.kind ?? "cake",
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
    base_price_cents: input.base_price_cents ?? null,
  };
  await run(
    input.id
      ? supabase.from("products").update(payload).eq("id", input.id)
      : supabase.from("products").insert(payload),
  );
}

export const deleteProduct = (id: string) =>
  run(supabase.from("products").delete().eq("id", id));

export type OptionGroupInput = Partial<Omit<OptionGroup, "id">> & { name: string };

export async function saveOptionGroup(input: OptionGroupInput & { id?: string }) {
  const payload = {
    name: input.name.trim(),
    key: input.key?.trim() || slugify(input.name),
    description: input.description?.trim() || null,
    select_type: input.select_type ?? "single",
    is_required: input.is_required ?? false,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };
  await run(
    input.id
      ? supabase.from("option_groups").update(payload).eq("id", input.id)
      : supabase.from("option_groups").insert(payload),
  );
}

export const deleteOptionGroup = (id: string) =>
  run(supabase.from("option_groups").delete().eq("id", id));

export type OptionInput = Partial<Omit<CatalogOption, "id">> & {
  name: string;
  group_id: string;
};

export async function saveOption(input: OptionInput & { id?: string }) {
  const payload = {
    group_id: input.group_id,
    name: input.name.trim(),
    key: input.key?.trim() || slugify(input.name),
    description: input.description?.trim() || null,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
    price_adjustment_cents: input.price_adjustment_cents ?? 0,
    svg_token: input.svg_token?.trim() || null,
    metadata: (input.metadata ?? {}) as never,
  };
  await run(
    input.id
      ? supabase.from("options").update(payload).eq("id", input.id)
      : supabase.from("options").insert(payload),
  );
}

export const deleteOption = (id: string) =>
  run(supabase.from("options").delete().eq("id", id));

export async function createOptionRule(input: {
  option_id: string;
  rule_type: OptionRule["rule_type"];
  target_option_id: string;
}) {
  await run(supabase.from("option_rules").insert(input));
}

export const deleteOptionRule = (id: string) =>
  run(supabase.from("option_rules").delete().eq("id", id));

export async function setProductOptionGroup(input: {
  product_id: string;
  option_group_id: string;
  enabled: boolean;
  sort_order?: number;
}) {
  if (!input.enabled) {
    await run(
      supabase
        .from("product_option_groups")
        .delete()
        .eq("product_id", input.product_id)
        .eq("option_group_id", input.option_group_id),
    );
    return;
  }
  await run(
    supabase.from("product_option_groups").upsert(
      {
        product_id: input.product_id,
        option_group_id: input.option_group_id,
        sort_order: input.sort_order ?? 0,
      },
      { onConflict: "product_id,option_group_id" },
    ),
  );
}
