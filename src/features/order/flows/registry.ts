import { productFamily, type ProductBuilderId } from "@/config/product-builders";
import type { OrderFlow, OrderFlowId, OrderStepKey } from "./types";

/**
 * Workflow registry — the single mapping from product family to ordering
 * workflow. Product records stay free of workflow implementation detail: the
 * catalog stores a stable slug, `product-builders.ts` maps that slug to a
 * builder id, and this file maps the builder id to a workflow.
 */
export const ORDER_FLOWS: Record<OrderFlowId, OrderFlow> = {
  "custom-cake": {
    id: "custom-cake",
    label: "Custom Cake",
    steps: ["occasion", "product", "design", "details", "contact"],
    designStepLabel: "Cake",
    usesCakeBuilder: true,
    savesDesigns: true,
  },
  /**
   * Cupcakes, cheesecakes, biscuits/cookies, rusks, cake cups and tarts.
   * Their ordering questions are still to be confirmed with the bakery, so
   * this workflow deliberately asks nothing product-specific — the customer
   * can still send an enquiry and the detail is agreed on WhatsApp.
   */
  "generic-enquiry": {
    id: "generic-enquiry",
    label: "Product enquiry",
    steps: ["occasion", "product", "details", "contact"],
    designStepLabel: null,
    usesCakeBuilder: false,
    savesDesigns: false,
  },
};

/**
 * Builder id -> workflow. Future workflows (CupcakeOrderFlow, TartOrderFlow…)
 * are registered by pointing their builder id at a new flow above.
 */
const FLOW_BY_BUILDER: Record<ProductBuilderId, OrderFlowId> = {
  "cake-svg": "custom-cake",
  cupcake: "generic-enquiry",
  cheesecake: "generic-enquiry",
  cookie: "generic-enquiry",
  tart: "generic-enquiry",
  "cake-cup": "generic-enquiry",
  rusk: "generic-enquiry",
  none: "generic-enquiry",
};

/** The workflow a product slug orders through. */
export const orderFlowFor = (slug: string | null | undefined): OrderFlow =>
  ORDER_FLOWS[FLOW_BY_BUILDER[productFamily(slug).builder]];

/** Human labels for the wizard progress bar. */
const STEP_LABELS: Record<Exclude<OrderStepKey, "design">, string> = {
  occasion: "Occasion",
  product: "Product",
  details: "Details",
  contact: "Contact",
};

export const stepLabel = (key: OrderStepKey, flow: OrderFlow): string =>
  key === "design" ? (flow.designStepLabel ?? "Design") : STEP_LABELS[key];
