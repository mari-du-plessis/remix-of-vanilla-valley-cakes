import { useState } from "react";
import { toast } from "sonner";
import { useServingChart } from "@/features/catalog/hooks/useServingChart";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import { openWhatsApp } from "@/features/order/lib/whatsapp";
import { buildCartMessage, buildCartOrderPayload } from "../lib/buildCartOrder";
import type { CartContact, CartItem } from "../types";

/**
 * Sends the whole basket as one order.
 *
 *   validate → save the order → build the message → open WhatsApp
 *
 * Saving is best-effort: if the database is unreachable the customer still
 * reaches WhatsApp with a complete enquiry rather than losing their work.
 */
export function useSubmitCart() {
  const [submitting, setSubmitting] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const { chart } = useServingChart();

  const submit = async (items: CartItem[], contact: CartContact) => {
    if (items.length === 0) {
      toast.error("Your order is empty");
      return null;
    }
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast.error("Please add your name and phone number");
      return null;
    }

    setSubmitting(true);
    setFallbackMessage(null);

    const photoLines = items
      .map((item) =>
        "inspiration" in item.config && item.config.inspiration.url
          ? `*Inspiration photo:* ${item.config.inspiration.url}`
          : null,
      )
      .filter((line): line is string => line !== null);

    let orderNumber: string | null = null;
    try {
      const draft = buildCartMessage(items, contact, { chart, photoLines });
      const saved = await createOrder.mutateAsync(
        buildCartOrderPayload(items, contact, { summary: draft, chart }),
      );
      orderNumber = saved.orderNumber;
    } catch {
      toast.error("We couldn't save your request — sending it on WhatsApp instead.");
    }

    const message = buildCartMessage(items, contact, { chart, photoLines, orderNumber });
    if (openWhatsApp(message)) {
      toast.success("Opening WhatsApp with your order…");
    } else {
      setFallbackMessage(message);
      toast.error("Your browser blocked WhatsApp — use the link below to continue.");
    }

    setSubmitting(false);
    return orderNumber;
  };

  return { submit, submitting, fallbackMessage, clearFallback: () => setFallbackMessage(null) };
}
