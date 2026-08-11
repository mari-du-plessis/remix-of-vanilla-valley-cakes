/**
 * Inspiration preview — pure input model.
 *
 * The AI illustration may only ever see cake appearance information. Customer
 * identity, contact details, delivery, allergies, pricing, quotes, calendar and
 * internal notes are deliberately never part of this projection, so the prompt
 * cannot leak them.
 */

import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { sizeLabel as resolveSizeLabel } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "@/features/order/types";
import { clampTierCount } from "./geometry";
import {
  DECORATION_COLOUR_FIELDS,
  decorationColour,
  tierColour,
  type CakeAppearance,
} from "./appearance";


export type InspirationInput = {
  product: string;
  shape: string;
  size: string;
  tierCount: number;
  flavours: string[];
  fillings: string[];
  icing: string;
  /** Solid, ombre or fault line. */
  colourTreatment: string;
  /** Colour per tier, bottom tier first; empty entries mean "follow the photo". */
  tierColours: string[];
  decorations: string[];
  /** Decoration colours that never inherit the cake colour. */
  decorationColours: { label: string; value: string }[];
  topperStyle: string;
  topperColour: string;
  topperWording: string;
  message: string;
  /** Free-text styling notes the customer typed about the cake itself. */
  notes: string;
  /** Uploaded reference photo, when the customer supplied one. */
  inspirationImageUrl: string;
};

const pretty = (value: string) =>
  value
    .replace(/^(shape|icing|decor|size)-/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * Notes are free text, so anything that reads like logistics, allergies or
 * contact information is stripped before the prompt is built.
 */
const EXCLUDED_NOTE_TERMS =
  /(allerg|gluten|nut|lactose|dairy|deliver|collect|pick ?up|address|phone|whatsapp|email|invoice|deposit|pay|price|quote|contact)/i;

const appearanceNotes = (notes: string) =>
  notes
    .split(/\r?\n|(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter((line) => line && !EXCLUDED_NOTE_TERMS.test(line))
    .join(" ")
    .slice(0, 400);

export function buildInspirationInput(
  form: OrderFormState,
  catalog: CakeCatalog,
  extra: { notes?: string; inspirationImageUrl?: string | null } = {},
): InspirationInput {
  const flavours = form.tiers.length > 0 ? form.tiers.map((t) => t.flavour) : [form.flavour];
  const fillings = form.tiers.length > 0 ? form.tiers.map((t) => t.filling) : [form.filling];

  const appearance: CakeAppearance = form.appearance;
  const count = clampTierCount(form.tiers.length || 1);
  const decorationColours = DECORATION_COLOUR_FIELDS.map((field) => ({
    label: field.label,
    value: decorationColour(appearance, field.key)?.name ?? "",
  })).filter((entry) => entry.value);

  return {
    product: form.product ? pretty(form.product) : "Celebration cake",
    shape: form.shapeKey ? pretty(form.shapeKey) : "Round",
    size: form.size ? resolveSizeLabel(catalog, form.size) : "",
    tierCount: clampTierCount(form.tiers.length || 1),
    flavours: flavours.filter(Boolean),
    fillings: fillings.filter(Boolean),
    icing: form.icingKey ? pretty(form.icingKey) : "",
    colourTreatment: appearance.treatment,
    tierColours: Array.from(
      { length: count },
      (_, i) => tierColour(appearance, i)?.name ?? "",
    ),
    decorations: form.extras,
    decorationColours,
    topperStyle: appearance.topper.style.trim(),
    topperColour: decorationColour(appearance, "topper")?.name ?? "",
    topperWording: appearance.topper.wording.trim(),
    message: form.cakeText.trim().slice(0, 40),
    notes: appearanceNotes(extra.notes ?? ""),
    inspirationImageUrl: extra.inspirationImageUrl ?? "",
  };
}

/**
 * Stable fingerprint of the cake design. Used only to tell the customer their
 * design has moved on since the last preview — never sent to the model.
 */
export function designSignature(input: InspirationInput): string {
  return JSON.stringify([
    input.product,
    input.shape,
    input.size,
    input.tierCount,
    input.flavours,
    input.fillings,
    input.icing,
    input.colourTreatment,
    input.tierColours,
    [...input.decorations].sort(),
    input.decorationColours,
    input.topperStyle,
    input.topperColour,
    input.topperWording,
    input.message,
  ]);
}
