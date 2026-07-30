import { useState } from "react";
import { toast } from "sonner";
import { buildWhatsAppLink } from "@/config/brand";
import { BUCKETS, uploadToBucket } from "@/lib/supabase/storage";
import { buildOrderMessage } from "../lib/buildOrderMessage";
import type { OrderFormState } from "../types";

/**
 * Submits the order by uploading any inspiration photo and opening WhatsApp
 * with the formatted summary. Isolated so a future "save order to database"
 * step can be added without touching the UI.
 */
export function useSubmitOrder() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (form: OrderFormState) => {
    if (!form.name || !form.phone) {
      toast.error("Please add your name and phone number");
      return;
    }
    setSubmitting(true);

    let photoLine: string | null = null;
    if (form.inspirationFile) {
      const t = toast.loading("Uploading inspiration photo…");
      const result = await uploadToBucket(BUCKETS.inspiration, form.inspirationFile);
      toast.dismiss(t);
      photoLine = result.ok
        ? `*Inspiration photo:* ${result.publicUrl}`
        : `*Inspiration photo:* ${form.inspirationFile.name} (upload failed — please send on WhatsApp)`;
    }

    const message = buildOrderMessage(form, { photoLine });
    window.open(buildWhatsAppLink(message), "_blank");
    toast.success("Opening WhatsApp…");
    setSubmitting(false);
  };

  return { submit, submitting };
}
