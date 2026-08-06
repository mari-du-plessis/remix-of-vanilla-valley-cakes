import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common";
import { QuoteList } from "@/features/quotes/components/QuoteList";
import { useGenerateQuote, useOrderQuotes } from "@/features/quotes/hooks/useQuotes";

/**
 * Quote panel shown on an order. Generating a quote runs the pricing engine
 * server-side and opens a fully editable draft.
 */
export function OrderQuotesPanel({ orderId }: { orderId: string }) {
  const { data: quotes, isPending } = useOrderQuotes(orderId);
  const generate = useGenerateQuote();

  return (
    <div className="space-y-4">
      {isPending ? (
        <LoadingState label="Loading quotes…" />
      ) : (
        <QuoteList
          quotes={quotes ?? []}
          compact
          emptyMessage="No quote yet — generate one from the active price list."
        />
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={generate.isPending}
        onClick={() => generate.mutate({ orderId })}
      >
        <FilePlus2 className="mr-2 h-4 w-4" />
        {generate.isPending
          ? "Generating…"
          : (quotes?.length ?? 0) > 0
            ? "New revision"
            : "Generate quote"}
      </Button>
    </div>
  );
}
