import { useState } from "react";
import { toast } from "sonner";
import { BUCKETS, uploadToBucket } from "@/lib/supabase/storage";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { sizeLabel as resolveSizeLabel } from "@/features/catalog/lib/cake-catalog";
import { buildOrderPayload } from "@/features/orders/lib/buildOrderPayload";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { buildOrderMessage } from "../lib/buildOrderMessage";
import { openWhatsApp } from "../lib/whatsapp";
import type { InspirationConcept } from "./useInspirationConcept";
import type { OrderFormState } from "../types";

/**
 * One-step submission. Pressing “Send via WhatsApp” runs the whole workflow:
 *
 *   validate → finish uploads → save the order → build the message → open WhatsApp
 *
 * The AI concept is generated earlier, in the background, while the customer
 * fills in their details (see `useInspirationConcept`). Submission therefore
 * never waits for the model: a concept that is still rendering is simply left
 * out of this message and attached to the saved order when it finishes.
 */
export function useSubmitOrder(concept?: InspirationConcept) {
  const [submitting, setSubmitting] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const { catalog } = useCakeCatalog();

  const submit = async (form: OrderFormState) => {
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);
    setFallbackMessage(null);

    /* 1 — uploads (usually already done alongside the background concept) */
    let inspirationUrl: string | null = concept?.inspirationUrl ?? null;
    let uploadFailed = concept?.uploadFailed ?? false;

    if (form.inspirationFile && !concept?.uploadHandled) {
      const t = toast.loading("Uploading inspiration photo…");
      const result = await uploadToBucket(BUCKETS.inspiration, form.inspirationFile);
      toast.dismiss(t);
      if (result.ok) inspirationUrl = result.publicUrl;
      else uploadFailed = true;
    }

    const photoLine = form.inspirationFile
      ? inspirationUrl
        ? `*Inspiration photo:* ${inspirationUrl}`
        : uploadFailed
          ? `*Inspiration photo:* ${form.inspirationFile.name} (upload failed — please send on WhatsApp)`
          : null
      : null;

    /* 2 — AI concept: only whatever is ready right now */
    const readyConceptUrl = concept?.status === "ready" ? concept.url : "";
    const shareConcept = readyConceptUrl && concept?.include !== false;

    const sizeLabel = form.size ? resolveSizeLabel(catalog, form.size) : undefined;
    /* Saved with the order regardless of the sharing choice. */
    const formWithConcept: OrderFormState = { ...form, aiPreviewUrl: readyConceptUrl };
    /* The message only carries it when the customer left the box ticked. */
    const formForMessage: OrderFormState = {
      ...form,
      aiPreviewUrl: shareConcept ? readyConceptUrl : "",
    };

    /* 3 — persistence (first, so the reference number can head the message) */
    let orderNumber: string | null = null;
    try {
      const draft = buildOrderMessage(formForMessage, { photoLine, sizeLabel });
      const saved = await createOrder.mutateAsync(
        buildOrderPayload(formWithConcept, { inspirationUrl, summary: draft, sizeLabel }),
      );
      orderNumber = saved.orderNumber;
      /* A concept still rendering is attached to this order once it lands. */
      if (!readyConceptUrl) concept?.attachWhenReady(saved.id);
    } catch {
      toast.error("We couldn't save your request — sending it on WhatsApp instead.");
    }

    const finalMessage = buildOrderMessage(formForMessage, {
      photoLine,
      sizeLabel,
      orderNumber,
    });

    /* 4 — hand-off */
    if (openWhatsApp(finalMessage)) {
      toast.success("Opening WhatsApp with your request…");
    } else {
      setFallbackMessage(finalMessage);
      toast.error("Your browser blocked WhatsApp — use the link below to continue.");
    }

    setSubmitting(false);
    return readyConceptUrl;
  };

  return {
    submit,
    submitting,
    /** Set only when opening WhatsApp genuinely failed. */
    fallbackMessage,
    clearFallback: () => setFallbackMessage(null),
  };
}
