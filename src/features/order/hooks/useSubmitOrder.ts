import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BUCKETS, uploadToBucket } from "@/lib/supabase/storage";
import { usesCakeRenderer } from "@/config/product-builders";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { sizeLabel as resolveSizeLabel } from "@/features/catalog/lib/cake-catalog";
import { generateInspirationPreview } from "@/features/cake-builder/api/inspiration.functions";
import { buildInspirationInput } from "@/features/cake-builder/lib/inspiration";
import { buildOrderPayload } from "@/features/orders/lib/buildOrderPayload";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { buildOrderMessage } from "../lib/buildOrderMessage";
import { openWhatsApp } from "../lib/whatsapp";
import type { OrderFormState } from "../types";

/**
 * One-step submission. Pressing “Send via WhatsApp” runs the whole workflow:
 *
 *   validate → upload inspiration → save the order → generate the AI concept
 *   → build the message → open WhatsApp
 *
 * Neither persistence nor AI generation may block the customer: a failure in
 * either step is reported quietly and WhatsApp still opens. A fallback link is
 * surfaced only when the browser genuinely refuses to open WhatsApp.
 */
export function useSubmitOrder() {
  const [submitting, setSubmitting] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const { catalog } = useCakeCatalog();
  const generateConcept = useServerFn(generateInspirationPreview);

  const submit = async (form: OrderFormState) => {
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);
    setFallbackMessage(null);

    /* 1 — uploads */
    let inspirationUrl: string | null = null;
    let photoLine: string | null = null;
    if (form.inspirationFile) {
      const t = toast.loading("Uploading inspiration photo…");
      const result = await uploadToBucket(BUCKETS.inspiration, form.inspirationFile);
      toast.dismiss(t);
      if (result.ok) {
        inspirationUrl = result.publicUrl;
        photoLine = `*Inspiration photo:* ${result.publicUrl}`;
      } else {
        photoLine = `*Inspiration photo:* ${form.inspirationFile.name} (upload failed — please send on WhatsApp)`;
      }
    }

    /* 2 — AI concept, only for product families that have the cake builder */
    let aiPreviewUrl = form.aiPreviewUrl;
    if (usesCakeRenderer(form.product)) {
      const t = toast.loading("Creating your concept artwork…");
      try {
        const input = buildInspirationInput(form, catalog, {
          notes: form.notes,
          inspirationImageUrl: inspirationUrl,
        });
        const result = await generateConcept({ data: input });
        aiPreviewUrl = result.url;
      } catch {
        /* never blocks the order — the concept is simply omitted */
      } finally {
        toast.dismiss(t);
      }
    }

    const sizeLabel = form.size ? resolveSizeLabel(catalog, form.size) : undefined;
    const formWithConcept: OrderFormState = { ...form, aiPreviewUrl };
    const message = buildOrderMessage(formWithConcept, { photoLine, sizeLabel });

    /* 3 — persistence */
    let orderNumber: string | null = null;
    try {
      const saved = await createOrder.mutateAsync(
        buildOrderPayload(formWithConcept, { inspirationUrl, summary: message, sizeLabel }),
      );
      orderNumber = saved.orderNumber;
    } catch {
      toast.error("We couldn't save your request — sending it on WhatsApp instead.");
    }

    const finalMessage = orderNumber ? `${message}\n\n*Reference:* ${orderNumber}` : message;

    /* 4 — hand-off */
    if (openWhatsApp(finalMessage)) {
      toast.success("Opening WhatsApp with your request…");
    } else {
      setFallbackMessage(finalMessage);
      toast.error("Your browser blocked WhatsApp — use the link below to continue.");
    }

    setSubmitting(false);
    return aiPreviewUrl;
  };

  return {
    submit,
    submitting,
    /** Set only when opening WhatsApp genuinely failed. */
    fallbackMessage,
    clearFallback: () => setFallbackMessage(null),
  };
}
