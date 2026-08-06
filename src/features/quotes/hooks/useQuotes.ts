import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  addQuoteLine,
  addQuoteNote,
  createQuoteFromOrder,
  deleteQuote,
  editQuoteLine,
  getQuote,
  listQuotes,
  removeQuoteLine,
  saveQuoteSettings,
} from "../api/quotes.functions";
import type { QuoteLineInput, QuoteSettingsInput } from "../api/schema";
import type { QuoteDetail, QuoteListItem, QuoteStatus } from "../types";

export const quoteKeys = {
  all: ["quotes"] as const,
  list: (status: QuoteStatus | "all", search: string) =>
    ["quotes", "list", status, search] as const,
  forOrder: (orderId: string) => ["quotes", "order", orderId] as const,
  detail: (quoteId: string) => ["quotes", "detail", quoteId] as const,
};

export function useQuotes(status: QuoteStatus | "all" = "all", search = "") {
  const fetchQuotes = useServerFn(listQuotes);
  return useQuery<QuoteListItem[]>({
    queryKey: quoteKeys.list(status, search),
    queryFn: () => fetchQuotes({ data: { status, search } }),
  });
}

/** Quotes attached to one order — powers the order detail panel. */
export function useOrderQuotes(orderId: string) {
  const fetchQuotes = useServerFn(listQuotes);
  return useQuery<QuoteListItem[]>({
    queryKey: quoteKeys.forOrder(orderId),
    queryFn: () => fetchQuotes({ data: { orderId } }),
  });
}

export function useQuote(quoteId: string) {
  const fetchQuote = useServerFn(getQuote);
  return useQuery<QuoteDetail>({
    queryKey: quoteKeys.detail(quoteId),
    queryFn: () => fetchQuote({ data: { quoteId } }),
  });
}

/** Shared mutation wiring: invalidate every quote query, toast the outcome. */
function useQuoteMutation<TInput, TResult>(
  run: (input: TInput) => Promise<TResult>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useGenerateQuote() {
  const mutate = useServerFn(createQuoteFromOrder);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderId: string; priceListId?: string | null }) =>
      mutate({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Quote generated from the price list");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddQuoteLine() {
  const mutate = useServerFn(addQuoteLine);
  return useQuoteMutation((input: QuoteLineInput) => mutate({ data: input }), "Line added");
}

export function useUpdateQuoteLine() {
  const mutate = useServerFn(editQuoteLine);
  return useQuoteMutation(
    (input: { id: string; values: Partial<Omit<QuoteLineInput, "quoteId">> }) =>
      mutate({ data: input }),
    "Line updated",
  );
}

export function useDeleteQuoteLine() {
  const mutate = useServerFn(removeQuoteLine);
  return useQuoteMutation((id: string) => mutate({ data: { id } }), "Line removed");
}

export function useSaveQuoteSettings() {
  const mutate = useServerFn(saveQuoteSettings);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuoteSettingsInput) => mutate({ data: input }),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      // Accepting a quote confirms its order server-side — refresh order views.
      if ((input as { values?: { status?: string } }).values?.status === "accepted") {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        toast.success("Quote accepted — order marked as confirmed");
        return;
      }
      toast.success("Quote updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddQuoteNote() {
  const mutate = useServerFn(addQuoteNote);
  return useQuoteMutation(
    (input: { quoteId: string; body: string }) => mutate({ data: input }),
    "Note added",
  );
}

export function useDeleteQuote() {
  const mutate = useServerFn(deleteQuote);
  return useQuoteMutation((id: string) => mutate({ data: { id } }), "Quote deleted");
}
