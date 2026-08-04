import { createFileRoute } from "@tanstack/react-router";
import { ProductsManager } from "@/features/admin/catalog/ProductsManager";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Manage bakery categories, products, option groups, options and signature pairings.",
      },
    ],
  }),
  component: ProductsManager,
});
