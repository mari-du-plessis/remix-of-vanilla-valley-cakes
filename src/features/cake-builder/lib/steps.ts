/**
 * Guided cake builder — pure step model.
 *
 * The customer never sees "option groups"; they see a short conversation that
 * follows the bakery's own workflow. This module turns whatever the catalog and
 * asset library currently hold into that conversation, so a new product,
 * option or SVG asset appears in the builder without any rendering or UI code
 * changing.
 *
 * Nothing here touches React, Supabase or the DOM: the same step list drives
 * the customer wizard today and can drive an admin capture screen, a saved
 * cake template or a future top-view builder later.
 */

import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { CatalogOption, OptionGroup, Product } from "@/features/catalog/types";
import { spongeColour, fillingColour } from "@/config/cake-builder";
import type { CakeAsset } from "../types";

export type BuilderStepKind =
  | "product"
  | "shape"
  | "size"
  | "tiers"
  | "flavour"
  | "filling"
  | "icing"
  | "decoration";

export type BuilderChoice = {
  /** Stable value stored on the order form. */
  id: string;
  label: string;
  hint?: string;
  /** Asset the choice previews with, when the library has artwork for it. */
  assetKey?: string | null;
  /** Colour swatch used when there is no artwork (flavours, fillings). */
  swatch?: string | null;
};

export type BuilderStep = {
  key: string;
  kind: BuilderStepKind;
  title: string;
  subtitle: string;
  choices: BuilderChoice[];
  /** Asked once per tier (flavour, filling). */
  perTier: boolean;
  /** Several choices can be active at once (decorations). */
  multi: boolean;
  /** The customer may continue without answering. */
  optional: boolean;
};

export type StepSources = {
  products: Product[];
  groups: OptionGroup[];
  options: CatalogOption[];
  assets: CakeAsset[];
};

/** Product kinds a customer can design in the builder. */
const DESIGNABLE_KINDS = new Set(["cake", "baked_good"]);

const activeAssets = (assets: CakeAsset[], prefix: string) =>
  assets
    .filter((a) => a.is_active && a.key.startsWith(prefix))
    .sort((a, b) => a.z_index - b.z_index || a.name.localeCompare(b.name));

function optionsOfGroup(sources: StepSources, groupKey: string): CatalogOption[] {
  const group = sources.groups.find((g) => g.key === groupKey);
  if (!group) return [];
  return sources.options
    .filter((o) => o.group_id === group.id && o.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Choices for a visual group: catalog options first (the bakery's own wording),
 * falling back to the asset library so the builder is never empty before the
 * catalog is fully configured.
 */
function visualChoices(
  sources: StepSources,
  groupKey: string,
  assetPrefix: string,
): BuilderChoice[] {
  const assetKeys = new Set(sources.assets.filter((a) => a.is_active).map((a) => a.key));
  const fromCatalog = optionsOfGroup(sources, groupKey)
    .map((option): BuilderChoice | null => {
      const assetKey =
        (option.svg_token && assetKeys.has(option.svg_token) && option.svg_token) ||
        (assetKeys.has(option.key) ? option.key : null);
      return assetKey
        ? { id: assetKey, label: option.name, hint: option.description ?? undefined, assetKey }
        : null;
    })
    .filter((c): c is BuilderChoice => c !== null);

  if (fromCatalog.length > 0) return fromCatalog;

  return activeAssets(sources.assets, assetPrefix).map((asset) => ({
    id: asset.key,
    label: asset.name,
    hint: asset.notes ?? undefined,
    assetKey: asset.key,
  }));
}

/** Tier choices stop at the bakery's real maximum, shared with the renderer. */
const TIER_CHOICES: BuilderChoice[] = [
  { id: "1", label: "Single tier", hint: "Classic celebration cake" },
  { id: "2", label: "Two tiers", hint: "A little more presence" },
  { id: "3", label: "Three tiers", hint: "Weddings & large events" },
  { id: "4", label: "Four tiers", hint: "Statement centrepiece" },
  { id: "5", label: "Five tiers", hint: "The full showpiece" },
].slice(0, MAX_TIERS);

/**
 * Sizes describe how many guests a cake serves. Product types that are their
 * own product (cupcakes, cake cups) must never appear as a cake size.
 */
const NON_CAKE_SIZE = /cupcake|cup cake|cake cup|biscuit|cookie|rusk/i;


/** Builds the guided conversation from whatever the bakery has configured. */
export function buildBuilderSteps(catalog: CakeCatalog, sources: StepSources): BuilderStep[] {
  const steps: BuilderStep[] = [];

  const products = sources.products.filter(
    (p) => p.is_active && DESIGNABLE_KINDS.has(String(p.kind)),
  );
  if (products.length > 1) {
    steps.push({
      key: "product",
      kind: "product",
      title: "What are we baking?",
      subtitle: "Start with the kind of creation you have in mind.",
      choices: products.map((p) => ({
        id: p.slug,
        label: p.name,
        hint: p.description ?? undefined,
      })),
      perTier: false,
      multi: false,
      optional: true,
    });
  }

  const shapes = visualChoices(sources, "shape", "shape-");
  if (shapes.length > 0) {
    steps.push({
      key: "shape",
      kind: "shape",
      title: "Choose a shape",
      subtitle: "The silhouette your cake is built around.",
      choices: shapes,
      perTier: false,
      multi: false,
      optional: false,
    });
  }

  steps.push({
    key: "size",
    kind: "size",
    title: "Choose a size",
    subtitle: "How many guests are we serving?",
    choices: catalog.sizes.map((s) => ({ id: s.id, label: s.label, hint: s.serves })),
    perTier: false,
    multi: false,
    optional: false,
  });

  steps.push({
    key: "tiers",
    kind: "tiers",
    title: "How many tiers?",
    subtitle: "Each tier can have its own flavour and filling.",
    choices: TIER_CHOICES,
    perTier: false,
    multi: false,
    optional: false,
  });

  steps.push({
    key: "flavour",
    kind: "flavour",
    title: "Choose your flavours",
    subtitle: "The sponge inside — we'll suggest a filling to match.",
    choices: catalog.flavours.map((f) => ({
      id: f.name,
      label: f.name,
      hint: f.pairing ? `Pairs with ${f.pairing}` : undefined,
      swatch: spongeColour(f.name),
    })),
    perTier: true,
    multi: false,
    optional: false,
  });

  steps.push({
    key: "filling",
    kind: "filling",
    title: "Choose your fillings",
    subtitle: "What sits between the layers.",
    choices: catalog.fillings.map((name) => ({
      id: name,
      label: name,
      swatch: fillingColour(name),
    })),
    perTier: true,
    multi: false,
    optional: false,
  });

  const icings = visualChoices(sources, "icing", "icing-");
  if (icings.length > 0) {
    steps.push({
      key: "icing",
      kind: "icing",
      title: "Choose your finish",
      subtitle: "How the outside of the cake is dressed.",
      choices: icings,
      perTier: false,
      multi: false,
      optional: false,
    });
  }

  steps.push({
    key: "decoration",
    kind: "decoration",
    title: "Finishing touches",
    subtitle: "Add as many — or as few — as you like.",
    choices: catalog.extras.map((name) => ({ id: name, label: name })),
    perTier: false,
    multi: true,
    optional: true,
  });

  return steps.filter((s) => s.choices.length > 0);
}
