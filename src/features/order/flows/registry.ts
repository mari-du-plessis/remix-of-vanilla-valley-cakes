import { productFamily, type ProductBuilderId } from "@/config/product-builders";
import { requirementsFor } from "./product-requirements";
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
    /* Choosing what we're baking comes first: it decides everything after it. */
    steps: ["product", "occasion", "design", "details", "contact"],
    designStepLabel: "Cake",
    usesCakeBuilder: true,
    savesDesigns: true,
  },
  /**
   * Cupcakes, cheesecakes, biscuits/cookies, rusks, cake cups and tarts. The
   * questions themselves come from the catalog (see `product-requirements.ts`),
   * so the bakery changes them without a developer.
   *
   * Simple products stay short: what we're baking, the product's own
   * questions, the details, then a review. The occasion is asked as an
   * optional field on the details stage rather than a stage of its own.
   */
  "product-selection": {
    id: "product-selection",
    label: "Product order",
    steps: ["product", "selections", "details", "contact"],
    designStepLabel: null,
    usesCakeBuilder: false,
    savesDesigns: false,
  },
  /** Fallback for a family with no questions configured yet. */
  "generic-enquiry": {
    id: "generic-enquiry",
    label: "Product enquiry",
    steps: ["product", "details", "contact"],
    designStepLabel: null,
    usesCakeBuilder: false,
    savesDesigns: false,
  },
};


/**
 * Builder id -> workflow. A family with configured requirements walks the
 * selections workflow; anything else falls back to the plain enquiry.
 */
const FLOW_BY_BUILDER: Record<ProductBuilderId, OrderFlowId> = {
  "cake-svg": "custom-cake",
  cupcake: "product-selection",
  cheesecake: "product-selection",
  cookie: "product-selection",
  tart: "product-selection",
  "cake-cup": "product-selection",
  rusk: "product-selection",
  none: "generic-enquiry",
};

/** The workflow a product slug orders through. */
export const orderFlowFor = (slug: string | null | undefined): OrderFlow => {
  const builder = productFamily(slug).builder;
  const flow = ORDER_FLOWS[FLOW_BY_BUILDER[builder]];
  /* No configured questions yet -> never show an empty stage. */
  if (flow.id === "product-selection" && !requirementsFor(builder))
    return ORDER_FLOWS["generic-enquiry"];
  return flow;
};

/**
 * Human labels for the wizard progress bar. Deliberately plain bakery words —
 * a customer never sees a workflow name, an option group or a product family.
 */
const STEP_LABELS: Record<Exclude<OrderStepKey, "design" | "selections">, string> = {
  occasion: "Occasion",
  product: "Choose",
  details: "Details",
  contact: "Review",
};


export const stepLabel = (
  key: OrderStepKey,
  flow: OrderFlow,
  selectionsLabel = "Choices",
): string => {
  if (key === "design") return flow.designStepLabel ?? "Design";
  if (key === "selections") return selectionsLabel;
  return STEP_LABELS[key];
};
