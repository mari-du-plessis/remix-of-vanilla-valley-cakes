import { createFileRoute } from "@tanstack/react-router";
import { OrdersManager } from "@/features/admin/orders/OrdersManager";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  head: () => ({
    meta: [
      { title: "Orders — Vanilla Valley Admin" },
      {
        name: "description",
        content: "Manage customer cake enquiries, quotations and confirmed orders.",
      },
    ],
  }),
  component: OrdersManager,
});
