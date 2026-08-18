/**
 * Ordering workflows.
 *
 * A product family decides *which ordering workflow* the customer walks
 * through. The Custom Cake has the full SVG Cake Builder; every other family
 * the bakery has confirmed asks its own catalog-driven questions on a
 * "selections" stage.
 *
 * Adding a workflow later is a data change here plus its own stage — nothing
 * in the Custom Cake workflow has to be rewritten.
 */

/** Stages the order wizard can contain. */
export type OrderStepKey =
  | "occasion"
  | "product"
  /** The Custom Cake builder. */
  | "design"
  /** Catalog-driven questions for a non-cake product family. */
  | "selections"
  | "details"
  | "contact";

export type OrderFlowId =
  | "custom-cake"
  /** Flavour / size / decoration / quantity, driven by the catalog. */
  | "product-selection"
  /** Fallback for a family with nothing configured yet: nothing invented. */
  | "generic-enquiry";

export type OrderFlow = {
  id: OrderFlowId;
  label: string;
  /** Wizard stages, in order, for this workflow. */
  steps: OrderStepKey[];
  /** Label shown for the `design` stage; null when the flow has none. */
  designStepLabel: string | null;
  /**
   * True only for workflows built on the SVG Cake Builder — tiers, per-tier
   * appearance, cake assets, live preview and the AI concept.
   */
  usesCakeBuilder: boolean;
  /** Whether this workflow produces something a customer can save and reopen. */
  savesDesigns: boolean;
};
