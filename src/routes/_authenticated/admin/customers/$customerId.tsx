import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetailView } from "@/features/admin/customers/CustomerDetailView";

export const Route = createFileRoute("/_authenticated/admin/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer profile — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Contact details, delivery addresses, internal notes and complete order history for one customer.",
      },
      { property: "og:title", content: "Customer profile — Vanilla Valley Admin" },
      {
        property: "og:description",
        content: "The central hub for one Vanilla Valley customer.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomerDetailRoute,
});

function CustomerDetailRoute() {
  const { customerId } = Route.useParams();
  return <CustomerDetailView customerId={customerId} />;
}
