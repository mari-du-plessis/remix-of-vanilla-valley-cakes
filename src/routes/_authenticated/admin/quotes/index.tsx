import { createFileRoute } from "@tanstack/react-router";
import { QuotesManager } from "@/features/admin/quotes/QuotesManager";

export const Route = createFileRoute("/_authenticated/admin/quotes/")({
  head: () => ({
    meta: [
      { title: "Quotes — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Generate, edit and track cake quotations, and export branded quotation PDFs.",
      },
    ],
  }),
  component: QuotesManager,
});
