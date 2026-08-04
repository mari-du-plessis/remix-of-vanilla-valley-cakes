import { tierLabel } from "@/features/order/lib/tiers";
import type { OrderFormState } from "@/features/order/types";
import type { CreateOrderInput } from "../api/schema";

/**
 * Pure mapper: cake-builder form state -> persistable order payload.
 * Lives here (not in the wizard) so any future intake surface — admin manual
 * capture, WhatsApp import, AI inspiration — can reuse the same shape.
 * `sizeLabel` is resolved by the caller from the catalog.
 */
export function buildOrderPayload(
  form: OrderFormState,
  extra: {
    inspirationUrl?: string | null;
    summary?: string | null;
    sizeLabel?: string;
  } = {},
): CreateOrderInput {
  const options: NonNullable<CreateOrderInput["items"][number]["options"]> = [];

  if (form.tiers.length > 0) {
    form.tiers.forEach((tier, index) => {
      const label = tierLabel(index, form.tiers.length);
      if (tier.flavour) {
        options.push({
          groupKey: "flavour",
          groupLabel: `${label} flavour`,
          valueLabel: tier.flavour,
          tierIndex: index,
        });
      }
      if (tier.filling) {
        options.push({
          groupKey: "filling",
          groupLabel: `${label} filling`,
          valueLabel: tier.filling,
          tierIndex: index,
        });
      }
    });
  } else {
    if (form.flavour) {
      options.push({
        groupKey: "flavour",
        groupLabel: "Flavour",
        valueLabel: form.flavour,
        tierIndex: null,
      });
    }
    if (form.filling) {
      options.push({
        groupKey: "filling",
        groupLabel: "Filling",
        valueLabel: form.filling,
        tierIndex: null,
      });
    }
  }

  form.extras.forEach((value) =>
    options.push({
      groupKey: "extra",
      groupLabel: "Extra",
      valueLabel: value,
      tierIndex: null,
    }),
  );

  return {
    customer: {
      name: form.name,
      phone: form.phone,
      email: form.email || "",
    },
    channel: "website",
    occasion: form.occasion || undefined,
    eventDate: form.eventDate || "",
    customerNotes: form.notes || undefined,
    inspirationUrl: extra.inspirationUrl || "",
    summary: extra.summary || undefined,
    items: [
      {
        name: "Custom Cake",
        sizeId: form.size || undefined,
        sizeLabel: form.size ? getSizeLabel(form.size) : undefined,
        quantity: 1,
        options,
      },
    ],
  };
}
