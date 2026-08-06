import { createFileRoute } from "@tanstack/react-router";
import { PricingManager } from "@/features/admin/pricing/PricingManager";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Manage internal price lists, product and option prices, delivery and rush fees and pricing rules.",
      },
    ],
  }),
  component: PricingManager,
});
