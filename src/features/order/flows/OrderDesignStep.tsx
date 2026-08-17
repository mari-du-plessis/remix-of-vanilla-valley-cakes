import { GuidedCakeBuilder } from "@/features/cake-builder/components/GuidedCakeBuilder";
import type { GuidedBuilder } from "@/features/cake-builder/hooks/useGuidedBuilder";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import type { OrderFormState } from "../types";
import type { OrderFlow } from "./types";

/**
 * Single extension point for product-specific design stages.
 *
 * Only the Custom Cake has one today; the other product families are on the
 * generic enquiry workflow, which has no design stage at all. A future
 * CupcakeOrderFlow adds its own branch here without touching the Custom Cake
 * workflow, the wizard frame or the order/WhatsApp pipeline.
 */
export function OrderDesignStep({
  flow,
  form,
  catalog,
  builder,
  onCakeTextChange,
  onAppearanceChange,
}: {
  flow: OrderFlow;
  form: OrderFormState;
  catalog: CakeCatalog;
  builder: GuidedBuilder;
  onCakeTextChange: (value: string) => void;
  onAppearanceChange: (value: OrderFormState["appearance"]) => void;
}) {
  if (flow.id === "custom-cake") {
    return (
      <GuidedCakeBuilder
        form={form}
        catalog={catalog}
        builder={builder}
        onCakeTextChange={onCakeTextChange}
        onAppearanceChange={onAppearanceChange}
      />
    );
  }
  return null;
}
