import { createFileRoute } from "@tanstack/react-router";
import { AssetLibraryManager } from "@/features/admin/cake-builder/AssetLibraryManager";

export const Route = createFileRoute("/_authenticated/admin/cake-builder")({
  head: () => ({
    meta: [
      { title: "Cake Builder Assets — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Manage the modular SVG assets the live cake builder renders, and link them to product options.",
      },
    ],
  }),
  component: AssetLibraryManager,
});
