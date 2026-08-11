/**
 * Custom cake appearance model.
 *
 * Appearance is a first-class part of a cake design rather than a bag of
 * generic options. Structure (shape, size, tiers) and the catalog's own
 * options (finish, decorations) are untouched — this module adds the
 * *colour* information the bakery actually works with:
 *
 *   • a colour treatment (solid, ombre, fault line)
 *   • a colour per tier, because tiers frequently differ
 *   • decoration colours that never inherit the cake colour (drip, macarons,
 *     flowers, metallic leaf, topper)
 *   • topper style and wording
 *
 * The bakery does **not** work from a fixed palette: colours are captured as
 * free text ("dusty rose", "sage", "champagne gold") and the customer's
 * inspiration photo remains the primary visual reference. `ColourValue`
 * carries an optional `hex`, so a future colour picker, multi-colour input or
 * palette extracted from the inspiration photo slots in without a data model
 * or database change.
 *
 * Nothing here touches React, Supabase or the DOM. The same structure feeds
 * the SVG renderer, the AI concept prompt, the WhatsApp summary and the saved
 * order (as ordinary `order_item_options` rows).
 */

import { CAKE_COLOR_DEFAULTS } from "@/config/cake-builder";

/** How the colour is applied across the cake. */
export type ColourTreatment = "solid" | "ombre" | "fault-line";

export const COLOUR_TREATMENTS: { id: ColourTreatment; label: string; hint: string }[] = [
  { id: "solid", label: "Solid colour", hint: "One colour per tier" },
  { id: "ombre", label: "Ombre", hint: "Shades blending through the cake" },
  { id: "fault-line", label: "Fault line", hint: "A revealed band around the cake" },
];

/**
 * A colour as the customer described it. `name` is free text on purpose;
 * `hex` is only ever a rendering hint and may be filled by a future picker.
 */
export type ColourValue = { name: string; hex?: string | null };

export type TierAppearance = { colour: ColourValue };

/** Decorations whose colour is chosen independently of the cake colour. */
export type DecorationColourKey = "drip" | "macaron" | "flower" | "metallic" | "topper";

export const DECORATION_COLOUR_FIELDS: {
  key: DecorationColourKey;
  label: string;
  hint: string;
  /** Words in a selected decoration that make this field relevant. */
  match: RegExp;
}[] = [
  { key: "drip", label: "Drip colour", hint: "e.g. gold, white chocolate", match: /drip/i },
  { key: "macaron", label: "Macaron colour", hint: "e.g. blush pink", match: /macaron/i },
  {
    key: "flower",
    label: "Flower colour / style",
    hint: "e.g. white roses with eucalyptus",
    match: /flower|rose|floral|bloom/i,
  },
  {
    key: "metallic",
    label: "Metallic leaf",
    hint: "Gold, rose gold or silver leaf",
    match: /leaf|gold|silver|metallic/i,
  },
  { key: "topper", label: "Topper colour", hint: "e.g. gold acrylic", match: /topper/i },
];

export type CakeAppearance = {
  treatment: ColourTreatment;
  /** Colour per tier, bottom tier first. Sparse entries are allowed. */
  tiers: TierAppearance[];
  decorations: Partial<Record<DecorationColourKey, ColourValue>>;
  topper: { style: string; wording: string };
};

export const EMPTY_APPEARANCE: CakeAppearance = {
  treatment: "solid",
  tiers: [],
  decorations: {},
  topper: { style: "", wording: "" },
};

/* ------------------------------- reading -------------------------------- */

const clean = (value: ColourValue | undefined | null): ColourValue | null =>
  value && value.name.trim() ? { name: value.name.trim(), hex: value.hex ?? null } : null;

/**
 * Colour for one tier. A single stated colour is intentionally *not* spread
 * across every tier automatically — it only fills in when the customer has
 * given exactly one colour for the whole cake.
 */
export function tierColour(appearance: CakeAppearance, index: number): ColourValue | null {
  const own = clean(appearance.tiers[index]?.colour);
  if (own) return own;
  const stated = appearance.tiers.map((t) => clean(t?.colour)).filter(Boolean) as ColourValue[];
  return stated.length === 1 ? stated[0]! : null;
}

export const decorationColour = (
  appearance: CakeAppearance,
  key: DecorationColourKey,
): ColourValue | null => clean(appearance.decorations[key]);

export const hasAppearanceColour = (appearance: CakeAppearance): boolean =>
  appearance.tiers.some((t) => clean(t?.colour)) ||
  Object.values(appearance.decorations).some((v) => clean(v));

/** Decoration colour fields worth asking about, given the chosen extras. */
export const relevantColourFields = (extras: string[]) =>
  DECORATION_COLOUR_FIELDS.filter((field) => extras.some((e) => field.match.test(e)));

/* ------------------------------- writing -------------------------------- */

export function setTierColour(
  appearance: CakeAppearance,
  index: number,
  name: string,
): CakeAppearance {
  const tiers = [...appearance.tiers];
  while (tiers.length <= index) tiers.push({ colour: { name: "" } });
  tiers[index] = { colour: { name } };
  return { ...appearance, tiers };
}

export const setDecorationColour = (
  appearance: CakeAppearance,
  key: DecorationColourKey,
  name: string,
): CakeAppearance => ({
  ...appearance,
  decorations: { ...appearance.decorations, [key]: { name } },
});

export const setTreatment = (
  appearance: CakeAppearance,
  treatment: ColourTreatment,
): CakeAppearance => ({ ...appearance, treatment });

export const setTopper = (
  appearance: CakeAppearance,
  patch: Partial<CakeAppearance["topper"]>,
): CakeAppearance => ({ ...appearance, topper: { ...appearance.topper, ...patch } });

/* ------------------------------ rendering -------------------------------- */

/**
 * Rendering-only hints. This is **not** a palette the customer picks from —
 * it exists so a described colour can tint the illustrative SVG. Anything not
 * recognised simply falls back to the default icing tone; the written colour
 * still reaches the bakery, the AI concept and the order.
 */
const COLOUR_HINTS: Record<string, string> = {
  white: "#f6f1e9",
  ivory: "#f3e9d8",
  cream: "#f5ecdc",
  blush: "#f1d7d3",
  pink: "#efc3ca",
  "dusty rose": "#d3a3a1",
  red: "#a8322f",
  burgundy: "#6d2233",
  peach: "#f2c9a8",
  terracotta: "#c07a55",
  orange: "#e2934c",
  yellow: "#efd97a",
  gold: "#c19a3d",
  "rose gold": "#c98b74",
  silver: "#c9cdd2",
  champagne: "#e2cfa5",
  sage: "#a8b79b",
  green: "#5f7a52",
  eucalyptus: "#8fa58c",
  teal: "#3f7b78",
  blue: "#5a7ba6",
  navy: "#26364f",
  lilac: "#c2b3d6",
  purple: "#6f4f86",
  lavender: "#cfc3e0",
  brown: "#7b5638",
  chocolate: "#503020",
  caramel: "#c8873f",
  black: "#241f1d",
  grey: "#9c9791",
  gray: "#9c9791",
  nude: "#e3cbb2",
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Best-effort colour for the illustration; `null` when nothing is recognised. */
export function resolveColourHex(value: ColourValue | null | undefined): string | null {
  if (!value) return null;
  if (value.hex && HEX.test(value.hex)) return value.hex;
  const name = value.name.trim().toLowerCase();
  if (!name) return null;
  if (HEX.test(name)) return name;
  if (COLOUR_HINTS[name]) return COLOUR_HINTS[name]!;
  const match = Object.keys(COLOUR_HINTS)
    .sort((a, b) => b.length - a.length)
    .find((key) => name.includes(key));
  return match ? COLOUR_HINTS[match]! : null;
}

export const icingHex = (value: ColourValue | null | undefined): string =>
  resolveColourHex(value) ?? CAKE_COLOR_DEFAULTS["--cake-icing"]!;

/* ------------------------------ summarising ------------------------------ */

const treatmentLabel = (treatment: ColourTreatment) =>
  COLOUR_TREATMENTS.find((t) => t.id === treatment)?.label ?? "Solid colour";

/**
 * Plain-language appearance lines, reused by the WhatsApp summary, the AI
 * prompt and the saved order so all three always describe the same design.
 */
export function appearanceLines(
  appearance: CakeAppearance,
  tierNames: string[],
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];

  if (appearance.treatment !== "solid")
    lines.push({ label: "Colour treatment", value: treatmentLabel(appearance.treatment) });

  tierNames.forEach((name, index) => {
    const colour = tierColour(appearance, index);
    if (colour) lines.push({ label: `${name} colour`, value: colour.name });
  });

  DECORATION_COLOUR_FIELDS.forEach((field) => {
    const colour = decorationColour(appearance, field.key);
    if (colour) lines.push({ label: field.label, value: colour.name });
  });

  if (appearance.topper.style.trim())
    lines.push({ label: "Topper style", value: appearance.topper.style.trim() });
  if (appearance.topper.wording.trim())
    lines.push({ label: "Topper wording", value: appearance.topper.wording.trim() });

  return lines;
}
