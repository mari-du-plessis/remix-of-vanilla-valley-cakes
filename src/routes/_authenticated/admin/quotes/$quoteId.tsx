import { createFileRoute } from "@tanstack/react-router";
import { QuoteDetailView } from "@/features/admin/quotes/QuoteDetailView";

export const Route = createFileRoute("/_authenticated/admin/quotes/$quoteId")({
  head: () => ({
    meta: [
      { title: "Quote details — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Edit quotation line items, deposit and terms, then preview or download the branded PDF.",
      },
    ],
  }),
  component: QuoteDetailRoute,
});

function QuoteDetailRoute() {
  const { quoteId } = Route.useParams();
  return <QuoteDetailView quoteId={quoteId} />;
}
