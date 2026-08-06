import { createFileRoute } from "@tanstack/react-router";
import { CustomersManager } from "@/features/admin/customers/CustomersManager";

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  head: () => ({
    meta: [
      { title: "Customers — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Search, filter and manage every Vanilla Valley customer, their addresses, tags and notes.",
      },
      { property: "og:title", content: "Customers — Vanilla Valley Admin" },
      {
        property: "og:description",
        content: "Manage customer profiles, delivery addresses and order history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CustomersManager,
});
