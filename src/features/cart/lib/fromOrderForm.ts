import { productFamily, usesCakeRenderer } from "@/config/product-builders";
import { tierPositionAt } from "@/features/cake-builder/lib/tier-position";
import type { OrderFormState } from "@/features/order/types";
import { EMPTY_INSPIRATION, type CartItem, type InspirationRef } from "../types";

/**
 * Bridge: the single-product wizard state -> a cart line.
 *
 * The wizard keeps its own working state while the customer configures one
 * product; the moment they add it to the basket it becomes a normal cart item
 * like any other. Keeping the translation in one pure function means the
 * wizard, a future admin capture screen and the "order this again" flow all
 * produce identical cart lines.
 */
export function cartItemFromOrderForm(
  form: OrderFormState,
  extra: { inspirationUrl?: string } = {},
): Omit<CartItem, "id" | "createdAt"> {
  const family = productFamily(form.product);
  const inspiration: InspirationRef = {
    ...EMPTY_INSPIRATION,
    url: extra.inspirationUrl ?? "",
    fileName: form.inspirationFile?.name ?? "",
    gallery: form.galleryInspiration,
  };

  if (usesCakeRenderer(form.product)) {
    /* Wizard tiers are stored bottom-first; positions are stamped explicitly. */
    const tiers = (form.tiers.length > 0
      ? form.tiers
      : [{ flavour: form.flavour, filling: form.filling }]
    ).map((tier, index, all) => ({
      id: `${index}`,
      position: tierPositionAt(index, all.length),
      sizeCm: null,
      servings: 0,
      flavour: tier.flavour,
      filling: tier.filling,
      fillingLocked: false,
      colour: form.appearance?.tierColours?.[index] ?? "",
      finish: form.icingKey,
      shape: form.shapeKey,
    }));

    return {
      type: "custom_cake",
      productSlug: form.product || "custom-cake",
      label: family.label,
      quantity: 1,
      config: {
        kind: "custom_cake",
        occasion: form.occasion,
        requestedServings: null,
        tiers,
        decorations: form.extras,
        candles: "",
        figurines: { required: false, description: "", quantity: 0 },
        inspiration,
        genderReveal: "",
        notes: form.notes,
        skipped: [],
      },
    };
  }

  return {
    type: "cupcakes",
    productSlug: form.product,
    label: family.label,
    quantity: Math.max(1, form.quantity),
    config: {
      kind: "cupcakes",
      occasion: form.occasion,
      selections: form.selections,
      inspiration,
      notes: form.notes,
      skipped: [],
    },
  };
}
