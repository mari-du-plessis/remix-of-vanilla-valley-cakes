import { EXTRAS, FILLINGS, FLAVOURS, SIZES, type CakeSize, type Flavour } from "@/config/catalog";
import type { CatalogOption, OptionGroup, OptionRule } from "../types";

/**
 * The shape the order wizard consumes. Identical to the legacy static config,
 * so the customer-facing UI is unchanged while the data now comes from the
 * catalog tables. The static config remains the typed fallback.
 */
export type CakeCatalog = {
  sizes: CakeSize[];
  flavours: Flavour[];
  fillings: string[];
  extras: string[];
};

export const FALLBACK_CAKE_CATALOG: CakeCatalog = {
  sizes: SIZES,
  flavours: FLAVOURS,
  fillings: FILLINGS,
  extras: EXTRAS,
};

/** Group keys the wizard depends on. */
export const CAKE_GROUP_KEYS = {
  size: "size",
  flavour: "flavour",
  filling: "filling",
  decoration: "decoration",
} as const;

const num = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const str = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

/** Options marked `selectable: false` exist only as pairing targets. */
const isSelectable = (option: CatalogOption) => option.metadata?.["selectable"] !== false;

/**
 * Pure projection: catalog rows -> the wizard's cake catalog.
 * Falls back per-section so a partially configured catalog can never empty
 * the order form.
 */
export function buildCakeCatalog(
  groups: OptionGroup[],
  options: CatalogOption[],
  rules: OptionRule[],
): CakeCatalog {
  const groupIdByKey = new Map(groups.map((g) => [g.key, g.id]));
  const optionsById = new Map(options.map((o) => [o.id, o]));
  const byGroup = (key: string) =>
    options
      .filter((o) => o.group_id === groupIdByKey.get(key) && o.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

  const sizeRows = byGroup(CAKE_GROUP_KEYS.size);
  const flavourRows = byGroup(CAKE_GROUP_KEYS.flavour);
  const fillingRows = byGroup(CAKE_GROUP_KEYS.filling);
  const decorationRows = byGroup(CAKE_GROUP_KEYS.decoration);

  const pairings = new Map<string, string>();
  for (const rule of rules) {
    if (rule.rule_type !== "pairs_with") continue;
    const target = rule.target_option_id ? optionsById.get(rule.target_option_id) : undefined;
    const label = target?.name ?? str(rule.target_label);
    if (label) pairings.set(rule.option_id, label);
  }

  const sizes: CakeSize[] = sizeRows.map((o) => ({
    id: o.key,
    label: o.name,
    serves: str(o.metadata?.["serves"]),
    tiers: num(o.metadata?.["tiers"]),
  }));

  const flavours: Flavour[] = flavourRows.map((o) => ({
    name: o.name,
    pairing: pairings.get(o.id) ?? null,
  }));

  return {
    sizes: sizes.length ? sizes : FALLBACK_CAKE_CATALOG.sizes,
    flavours: flavours.length ? flavours : FALLBACK_CAKE_CATALOG.flavours,
    fillings: fillingRows.length
      ? fillingRows.filter(isSelectable).map((o) => o.name)
      : FALLBACK_CAKE_CATALOG.fillings,
    extras: decorationRows.length
      ? decorationRows.map((o) => o.name)
      : FALLBACK_CAKE_CATALOG.extras,
  };
}

/* ------------------------- selectors over a catalog ------------------------ */

export const findSize = (catalog: CakeCatalog, id: string) =>
  catalog.sizes.find((s) => s.id === id);

export const sizeLabel = (catalog: CakeCatalog, id: string) =>
  findSize(catalog, id)?.label ?? id;

export const tierCount = (catalog: CakeCatalog, id: string) =>
  findSize(catalog, id)?.tiers ?? 0;

export const flavourPairing = (catalog: CakeCatalog, name: string) =>
  catalog.flavours.find((f) => f.name === name)?.pairing ?? null;
