/**
 * Catalog domain types.
 *
 * The catalog is the single source of truth for everything the bakery offers:
 * categories, products, option groups (Sizes, Flavours, Decorations…), options
 * and the rules that pair them. Rows are shaped exactly as stored so both the
 * public order wizard and the admin managers read one model.
 */

export type ProductKind = "cake" | "baked_good" | "gift_card" | "service" | "delivery";
export type OptionSelectType = "single" | "multi";
export type OptionRuleType = "pairs_with" | "requires" | "excludes";

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  kind: ProductKind;
  is_active: boolean;
  sort_order: number;
  base_price_cents: number | null;
};

export type OptionGroup = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  select_type: OptionSelectType;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
};

export type CatalogOption = {
  id: string;
  group_id: string;
  key: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  price_adjustment_cents: number;
  svg_token: string | null;
  metadata: Record<string, unknown>;
};

export type OptionRule = {
  id: string;
  option_id: string;
  rule_type: OptionRuleType;
  target_option_id: string | null;
  target_label: string | null;
};

export type ProductOptionGroupLink = {
  id: string;
  product_id: string;
  option_group_id: string;
  is_required: boolean | null;
  sort_order: number;
};

export const CATEGORY_COLUMNS =
  "id, slug, name, description, sort_order, is_active" as const;
export const PRODUCT_COLUMNS =
  "id, category_id, slug, name, description, kind, is_active, sort_order, base_price_cents" as const;
export const OPTION_GROUP_COLUMNS =
  "id, key, name, description, select_type, is_required, is_active, sort_order" as const;
export const OPTION_COLUMNS =
  "id, group_id, key, name, description, is_active, sort_order, price_adjustment_cents, svg_token, metadata" as const;
export const OPTION_RULE_COLUMNS =
  "id, option_id, rule_type, target_option_id, target_label" as const;
export const PRODUCT_OPTION_GROUP_COLUMNS =
  "id, product_id, option_group_id, is_required, sort_order" as const;

export const PRODUCT_KINDS: { value: ProductKind; label: string }[] = [
  { value: "cake", label: "Cake" },
  { value: "baked_good", label: "Baked good" },
  { value: "gift_card", label: "Gift card" },
  { value: "service", label: "Service" },
  { value: "delivery", label: "Delivery" },
];

export const catalogKeys = {
  all: ["catalog"] as const,
  categories: ["catalog", "categories"] as const,
  products: ["catalog", "products"] as const,
  groups: ["catalog", "option-groups"] as const,
  options: (groupId: string) => ["catalog", "options", groupId] as const,
  rules: ["catalog", "option-rules"] as const,
  productGroups: (productId: string) =>
    ["catalog", "product-option-groups", productId] as const,
  cake: ["catalog", "cake"] as const,
};
