import type { ProductBuilderId } from "@/config/product-builders";

/**
 * What each product family asks the customer for.
 *
 * This file holds *which questions* a family asks — never the answers. The
 * answers (flavours, sizes, decorations) live in the catalog tables and are
 * managed by the bakery in Admin → Products → Options, so adding a flavour
 * never needs a developer.
 *
 * The seeded flavours, sizes and decorations are provisional South African
 * bakery defaults confirmed as a starting point only — Sonja replaces them in
 * Admin without a code change.
 *
 * A future family is one entry here plus its option groups in Admin.
 */

export type QuantityRule = {
  /** Unit shown next to the stepper, e.g. "dozen", "each", "packs". */
  unit: string;
  /** Singular form, used when the customer asks for exactly one. */
  unitOne?: string;
  /** Increment of the stepper. */
  step: number;
  /** Starting value. */
  initial: number;
  min: number;
  max: number;
  /** Short helper line under the stepper. */
  hint?: string;
};

export type ProductRequirements = {
  /** Option group keys, in the order the customer answers them. */
  groupKeys: string[];
  /** Quantity question, when the family is ordered by amount. */
  quantity: QuantityRule | null;
  /** Heading for the selections stage. */
  headline: string;
  /** Label for the selections stage in the progress bar. */
  stepLabel: string;
  /** Whether an inspiration photo is offered on the details stage. */
  inspiration: boolean;
  /** Customer-facing explanation of why a photo helps, when offered. */
  inspirationHint?: string;
};

export const PRODUCT_REQUIREMENTS: Partial<Record<ProductBuilderId, ProductRequirements>> = {
  /** Sonja: inspiration picture, flavour, quantity, decoration. */
  cupcake: {
    groupKeys: ["cupcake-flavour", "cupcake-decoration"],
    quantity: {
      unit: "dozen",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Cupcakes are baked by the dozen.",
    },
    headline: "Tell us about your cupcakes",
    stepLabel: "Cupcakes",
    inspiration: true,
    inspirationHint:
      "A photo helps us understand the decoration and style you have in mind. It's optional — but it makes your quotation far more accurate.",
  },
  /** Sonja: flavour and size, fixed pricing. */
  cheesecake: {
    groupKeys: ["cheesecake-flavour", "cheesecake-size"],
    quantity: null,
    headline: "Choose your cheesecake",
    stepLabel: "Cheesecake",
    inspiration: false,
  },
  /** Sonja: flavour and quantity only. */
  cookie: {
    groupKeys: ["cookie-flavour"],
    quantity: {
      unit: "dozen",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Biscuits and cookies are baked by the dozen.",
    },
    headline: "Choose your cookies",
    stepLabel: "Cookies",
    inspiration: false,
  },
  /** Sonja: flavour and quantity only. */
  rusk: {
    groupKeys: ["rusk-flavour"],
    quantity: {
      unit: "packs",
      unitOne: "pack",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Rusks are packed per bag.",
    },
    headline: "Choose your rusks",
    stepLabel: "Rusks",
    inspiration: false,
  },
  /**
   * Sonja: flavour and one standard size. The size is an ordinary option
   * group, so a second size is added in Admin without touching this workflow.
   */
  "cake-cup": {
    groupKeys: ["cake-cup-flavour", "cake-cup-size"],
    quantity: null,
    headline: "Choose your cake cups",
    stepLabel: "Cake Cups",
    inspiration: false,
  },
  /** Sonja: flavour and size; the number of sizes comes from the catalog. */
  tart: {
    groupKeys: ["tart-flavour", "tart-size"],
    quantity: null,
    headline: "Choose your tart",
    stepLabel: "Tart",
    inspiration: false,
  },
};

export const requirementsFor = (
  builder: ProductBuilderId,
): ProductRequirements | null => PRODUCT_REQUIREMENTS[builder] ?? null;
