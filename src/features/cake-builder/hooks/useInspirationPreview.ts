import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateInspirationPreview } from "../api/inspiration.functions";
import type { InspirationInput } from "../lib/inspiration";

/**
 * On-demand AI illustration. Deliberately never automatic: the customer asks
 * for it, so the design can change freely without burning AI credits.
 */
export function useInspirationPreview() {
  const generate = useServerFn(generateInspirationPreview);

  return useMutation({
    mutationFn: async (input: InspirationInput) => generate({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "We couldn't create the inspiration preview."),
  });
}
