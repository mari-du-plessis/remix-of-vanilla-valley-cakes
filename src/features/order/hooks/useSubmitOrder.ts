import { useState } from "react";
import { toast } from "sonner";
import { buildWhatsAppLink } from "@/config/brand";
import { BUCKETS, uploadToBucket } from "@/lib/supabase/storage";
import { buildOrderPayload } from "@/features/orders/lib/buildOrderPayload";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { buildOrderMessage } from "../lib/buildOrderMessage";
import type { OrderFormState } from "../types";

/**
 * Submits the order:
 *   1. uploads any inspiration photo
 *   2. persists the enquiry as an Order (source of truth)
 *   3. opens WhatsApp with the formatted summary
 *
 * Persistence never blocks WhatsApp — if the database write fails the
 * customer still reaches the bakery, and the failure is surfaced quietly.
 */
export function useSubmitOrder() {
  const [submitting, setSubmitting] = useState(false);
  const createOrder = useCreateOrder();

  const submit = async (form: OrderFormState) => {
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);

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

    const message = buildOrderMessage(form, { photoLine });

    let orderNumber: string | null = null;
    try {
      const saved = await createOrder.mutateAsync(
        buildOrderPayload(form, { inspirationUrl, summary: message }),
      );
      orderNumber = saved.orderNumber;
    } catch {
      toast.error("We couldn't save your request — sending it on WhatsApp instead.");
    }

    const finalMessage = orderNumber ? `${message}\n\n*Reference:* ${orderNumber}` : message;
    window.open(buildWhatsAppLink(finalMessage), "_blank");
    toast.success("Opening WhatsApp…");
    setSubmitting(false);
  };

  return { submit, submitting };
}
