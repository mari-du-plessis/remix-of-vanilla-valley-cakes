import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { CakeCatalog } from "@/features/catalog/lib/cake-catalog";
import { generateInspirationPreview } from "@/features/cake-builder/api/inspiration.functions";
import { buildInspirationInput } from "@/features/cake-builder/lib/inspiration";
import { attachOrderAiPreview } from "@/features/orders/api/orders.functions";
import { BUCKETS, uploadToBucket } from "@/lib/supabase/storage";
import { usesCakeRenderer } from "@/config/product-builders";
import type { OrderFormState } from "../types";

/**
 * Background AI Inspiration Preview.
 *
 * Generation is kicked off as soon as the customer reaches "Your details", so
 * the artwork is usually ready before they press "Send via WhatsApp". It is
 * never allowed to block submission: the order is saved and WhatsApp opens
 * regardless, and a late-arriving concept is attached to the saved order
 * afterwards.
 *
 * Only cake appearance information reaches the model — `buildInspirationInput`
 * owns that projection, so contact and logistics data cannot leak in.
 */

export type ConceptStatus = "idle" | "pending" | "ready" | "failed";

type Outcome = { url: string; inspirationUrl: string | null; uploadFailed: boolean };

export function useInspirationConcept() {
  const generate = useServerFn(generateInspirationPreview);
  const attach = useServerFn(attachOrderAiPreview);

  const [status, setStatus] = useState<ConceptStatus>("idle");
  const [url, setUrl] = useState("");
  const [include, setInclude] = useState(true);
  /** Reference photo upload, done early so the model can use it as a style guide. */
  const [upload, setUpload] = useState<{ done: boolean; url: string | null; failed: boolean }>({
    done: false,
    url: null,
    failed: false,
  });

  /** In-flight run, so submission can await a late finish without blocking. */
  const runRef = useRef<Promise<Outcome> | null>(null);
  /** Guards against re-running for the same design when the step re-renders. */
  const startedRef = useRef(false);

  const start = useCallback(
    (form: OrderFormState, catalog: CakeCatalog) => {
      if (startedRef.current || !usesCakeRenderer(form.product)) return;
      startedRef.current = true;
      setStatus("pending");

      const run = (async (): Promise<Outcome> => {
        /* The reference photo is uploaded here so the model can use it as a
           style guide; submission later reuses the same URL. */
        let inspirationUrl: string | null = null;
        let uploadFailed = false;
        if (form.inspirationFile) {
          const result = await uploadToBucket(BUCKETS.inspiration, form.inspirationFile);
          if (result.ok) inspirationUrl = result.publicUrl;
          else uploadFailed = true;
        }
        setUpload({ done: true, url: inspirationUrl, failed: uploadFailed });

        try {
          const input = buildInspirationInput(form, catalog, {
            notes: form.notes,
            /* The customer's own photo wins; a gallery pick is the fallback
               style reference. */
            inspirationImageUrl: inspirationUrl ?? form.galleryInspiration?.url ?? null,
          });
          const result = await generate({ data: input });
          setUrl(result.url);
          setStatus("ready");
          return { url: result.url, inspirationUrl, uploadFailed };
        } catch {
          setStatus("failed");
          return { url: "", inspirationUrl, uploadFailed };
        }
      })();

      runRef.current = run;
    },
    [generate],
  );

  /** Lets the customer redo the concept if the first attempt failed. */
  const retry = useCallback(
    (form: OrderFormState, catalog: CakeCatalog) => {
      startedRef.current = false;
      setUpload({ done: false, url: null, failed: false });
      start(form, catalog);
    },
    [start],
  );

  /**
   * Called after the order is saved. If the concept is already available it
   * was persisted with the order; otherwise it is attached as soon as it
   * finishes, without holding up the WhatsApp hand-off.
   */
  const attachWhenReady = useCallback(
    (orderId: string) => {
      const run = runRef.current;
      if (!run) return;
      void run.then((outcome) => {
        if (!outcome.url) return;
        void attach({ data: { orderId, aiPreviewUrl: outcome.url } }).catch(() => {});
      });
    },
    [attach],
  );

  return {
    status,
    url,
    include,
    setInclude,
    /** Reference photo URL when it was uploaded early, else null. */
    inspirationUrl: upload.url,
    uploadFailed: upload.failed,
    /** True once the early upload finished, so submit can skip re-uploading. */
    uploadHandled: upload.done,
    start,
    retry,
    attachWhenReady,
  };
}

export type InspirationConcept = ReturnType<typeof useInspirationConcept>;
