import { createFileRoute } from "@tanstack/react-router";
import { OrderDetailView } from "@/features/admin/orders/OrderDetailView";

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — Vanilla Valley Admin" },
      {
        name: "description",
        content: "Review a customer cake order, update its status and keep internal notes.",
      },
    ],
  }),
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { orderId } = Route.useParams();
  return <OrderDetailView orderId={orderId} />;
}
