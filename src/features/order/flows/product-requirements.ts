import type { ProductBuilderId } from "@/config/product-builders";

/**
 * What each product family asks the customer for.
 *
 * This file holds *which questions* a family asks — never the answers. The
 * answers (flavours, sizes, decorations) live in the catalog tables and are
 * managed by the bakery in Admin → Products → Options, so adding a flavour
 * never needs a developer.
 *
 * A future family is one entry here plus its option groups in Admin.
 */

export type QuantityRule = {
  /** Unit shown next to the stepper, e.g. "dozen", "each", "packs". */
  unit: string;
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
};

export const PRODUCT_REQUIREMENTS: Partial<Record<ProductBuilderId, ProductRequirements>> = {
  cupcake: {
    groupKeys: ["cupcake-flavour", "cupcake-size", "cupcake-decoration"],
    quantity: {
      unit: "dozen",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Cupcakes are baked by the dozen.",
    },
    headline: "Your cupcakes",
    stepLabel: "Cupcakes",
  },
  cheesecake: {
    groupKeys: ["cheesecake-flavour", "cheesecake-size", "cheesecake-decoration"],
    quantity: null,
    headline: "Your cheesecake",
    stepLabel: "Cheesecake",
  },
  cookie: {
    groupKeys: ["cookie-flavour", "cookie-decoration"],
    quantity: {
      unit: "dozen",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Biscuits and cookies are baked by the dozen.",
    },
    headline: "Your biscuits",
    stepLabel: "Biscuits",
  },
  rusk: {
    groupKeys: ["rusk-flavour"],
    quantity: {
      unit: "packs",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
      hint: "Rusks are packed per bag.",
    },
    headline: "Your rusks",
    stepLabel: "Rusks",
  },
  "cake-cup": {
    groupKeys: ["cake-cup-flavour", "cake-cup-decoration"],
    quantity: {
      unit: "cups",
      step: 1,
      initial: 6,
      min: 1,
      max: 200,
      hint: "Tell us how many cake cups you need.",
    },
    headline: "Your cake cups",
    stepLabel: "Cake Cups",
  },
  tart: {
    groupKeys: ["tart-flavour", "tart-size"],
    quantity: {
      unit: "tarts",
      step: 1,
      initial: 1,
      min: 1,
      max: 50,
    },
    headline: "Your tarts",
    stepLabel: "Tarts",
  },
};

export const requirementsFor = (
  builder: ProductBuilderId,
): ProductRequirements | null => PRODUCT_REQUIREMENTS[builder] ?? null;
