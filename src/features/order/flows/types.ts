/**
 * Ordering workflows.
 *
 * A product family decides *which ordering workflow* the customer walks
 * through. Today only the Custom Cake has a designed workflow (the full SVG
 * Cake Builder); every other family uses the generic enquiry workflow until
 * the bakery has confirmed its requirements.
 *
 * Adding a workflow later is a data change here plus its own design step —
 * nothing in the Custom Cake workflow has to be rewritten.
 */

/** Stages the order wizard can contain. `design` is the flow's own stage. */
export type OrderStepKey = "occasion" | "product" | "design" | "details" | "contact";

export type OrderFlowId =
  | "custom-cake"
  /** Placeholder-free fallback: occasion, details, contact — nothing invented. */
  | "generic-enquiry";

export type OrderFlow = {
  id: OrderFlowId;
  label: string;
  /** Wizard stages, in order, for this workflow. */
  steps: OrderStepKey[];
  /** Label shown for the `design` stage; null when the flow has none yet. */
  designStepLabel: string | null;
  /**
   * True only for workflows built on the SVG Cake Builder — tiers, per-tier
   * appearance, cake assets, live preview and the AI concept.
   */
  usesCakeBuilder: boolean;
};
