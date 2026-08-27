import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/common";
import { Eyebrow } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { BRAND } from "@/config/brand";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { useOrderForm } from "@/features/order/hooks/useOrderForm";
import { useOrderFlow } from "@/features/order/flows/useOrderFlow";
import { stepLabel } from "@/features/order/flows/registry";
import { OrderDesignStep } from "@/features/order/flows/OrderDesignStep";
import { useProductSelections } from "@/features/order/hooks/useProductSelections";
import { requirementsFor } from "@/features/order/flows/product-requirements";
import { productFamily } from "@/config/product-builders";
import { OrderReviewPanel } from "@/features/order/components/OrderReviewPanel";
import { SelectionsStep } from "@/features/order/components/SelectionsStep";
import { useSubmitOrder } from "@/features/order/hooks/useSubmitOrder";
import { useInspirationConcept } from "@/features/order/hooks/useInspirationConcept";
import { whatsappUrl } from "@/features/order/lib/whatsapp";
import { useGuidedBuilder } from "@/features/cake-builder/hooks/useGuidedBuilder";
import type { BuilderStepKind } from "@/features/cake-builder/lib/steps";
import { OccasionStep } from "@/features/order/components/OccasionStep";
import { ProductStep } from "@/features/order/components/ProductStep";
import { DetailsStep } from "@/features/order/components/DetailsStep";
import { ContactStep } from "@/features/order/components/ContactStep";
import { SaveDesignDialog } from "@/features/saved-designs/components/SaveDesignDialog";
import { useSavedDesign } from "@/features/saved-designs/hooks/useSavedDesigns";
import { snapshotToForm } from "@/features/saved-designs/lib/snapshot";
import { useCakeTemplate } from "@/features/cake-templates/hooks/useCakeTemplates";
import { templateReference } from "@/features/cake-templates/types";

/** Product choice is a wizard stage now, so the builder never repeats it. */
const SKIP_KINDS: BuilderStepKind[] = ["product"];





export const Route = createFileRoute("/order")({
  /**
   * `?design=<id>` resumes a Saved Design. With `edit`, the wizard reopens the
   * builder and saving updates that design; without it the customer continues
   * straight to their enquiry. `?template=<slug>` starts from a Vanilla Valley
   * cake template — the template itself is never modified.
   *
   * Every parameter is optional, so plain `<Link to="/order" />` stays valid.
   */
  validateSearch: (
    search: Record<string, unknown>,
  ): { design?: string; edit?: boolean; template?: string } => {
    const parsed: { design?: string; edit?: boolean; template?: string } = {};
    if (typeof search["design"] === "string") parsed.design = search["design"];
    if (typeof search["template"] === "string") parsed.template = search["template"];
    if (search["edit"] === true || search["edit"] === "true") parsed.edit = true;
    return parsed;
  },

  head: () => ({
    meta: [
      { title: "Order a Custom Cake — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Design your custom cake in four quick steps — occasion, size, flavours and extras — then send it to us on WhatsApp.",
      },
      { property: "og:title", content: "Order a Custom Cake — Vanilla Valley Bakery" },
      {
        property: "og:description",
        content: "Design your custom cake in four quick steps and send it to us on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { catalog } = useCakeCatalog();
  const { design: designId, edit, template: templateSlug } = Route.useSearch();
  /* Product family -> ordering workflow -> the stages this wizard shows. */
  const [productSlug, setProductSlug] = useState("");
  const { flow, choices, steps } = useOrderFlow(productSlug);
  /* Catalog-driven questions for non-cake product families. */
  const selections = useProductSelections(productSlug);
  const order = useOrderForm(catalog, steps, selections.requiredKeys);
  const concept = useInspirationConcept();
  const { submit, submitting, fallbackMessage } = useSubmitOrder(concept);
  const { form, step, stepKey } = order;
  /** Human size label for the review panel; the catalog owns the wording. */
  const sizeLabel = catalog.sizes.find((s) => s.id === form.size)?.label;

  /* The flow follows whatever product the form currently holds. */
  useEffect(() => {
    setProductSlug(form.product);
  }, [form.product]);

  /* Saved Design hand-off: hydrate the wizard once the design arrives. */
  const saved = useSavedDesign(designId ?? null);
  const hydrated = useRef<string | null>(null);
  useEffect(() => {
    const record = saved.data;
    if (!record || hydrated.current === record.id) return;
    hydrated.current = record.id;
    order.loadForm(
      snapshotToForm(record.design, {
        aiPreviewUrl: record.aiPreviewUrl,
        aiPreviewSignature: record.aiPreviewSignature,
      }),
    );
    order.setStep(steps.indexOf(edit ? "design" : "details"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.data, edit]);

  /**
   * Template hand-off: the template's configuration is *copied* into the
   * customer's working design and only its identity is kept as a reference.
   * The template record itself is never modified, and anything the customer
   * changes from here belongs to them.
   */
  const template = useCakeTemplate(designId ? null : templateSlug);
  useEffect(() => {
    const record = template.data;
    if (!record || hydrated.current === record.id) return;
    hydrated.current = record.id;
    order.loadForm({
      ...snapshotToForm(record.design),
      templateRef: templateReference(record),
    });
    /* Straight into the builder, so it reads as "a design to adjust". */
    order.setStep(Math.max(0, steps.indexOf("design")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.data]);


  /**
   * The AI concept starts rendering the moment the customer reaches "Your
   * details", so it is usually on screen before they send the enquiry. The
   * hook itself guards against repeat runs — and against products that have
   * no cake design to illustrate.
   */
  const conceptStep = stepKey === "contact";
  useEffect(() => {
    if (conceptStep) concept.start(order.form, catalog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptStep]);

  /**
   * The cake builder owns its own sub-steps; the wizard's Back/Continue simply
   * drive them while the customer is designing, so there is only ever one set
   * of navigation on screen. Product selection is a wizard stage now, so the
   * builder never asks for it.
   */
  const builder = useGuidedBuilder(form, catalog, order, { skipKinds: SKIP_KINDS });
  const designing = stepKey === "design";
  const canContinue = designing ? builder.canAdvance : order.canContinue();

  const goBack = () =>
    designing && !builder.atStart ? builder.back() : order.setStep(step - 1);

  const goNext = () => {
    if (!canContinue) return toast.error("Please complete this step");
    if (designing && !builder.atEnd) return builder.next();
    order.setStep(step + 1);
  };

  return (
    <SiteShell footer={false}>
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-8 text-center">
          <Eyebrow className="text-primary">Bespoke commission</Eyebrow>
          <h1 className="mt-4 text-2xl sm:text-3xl">
            {flow.usesCakeBuilder ? "Design your cake" : "Send your enquiry"}
          </h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
        </div>

        <StepProgress
          steps={steps.map((key) => stepLabel(key, flow, selections.stepLabel))}
          current={step}
          className="mb-8"
        />

        <div className="surface-card rounded-3xl p-6 sm:p-8">

          {stepKey === "occasion" && (
            <OccasionStep value={form.occasion} onChange={(o) => order.update("occasion", o)} />
          )}

          {stepKey === "product" && (
            <ProductStep
              value={form.product}
              choices={choices}
              onChange={(slug) =>
                order.setProduct(
                  slug,
                  requirementsFor(productFamily(slug).builder)?.quantity?.initial ?? 1,
                )
              }
            />
          )}

          {designing && (
            <OrderDesignStep
              flow={flow}
              form={form}
              catalog={catalog}
              builder={builder}
              onCakeTextChange={(v) => order.update("cakeText", v)}
              onAppearanceChange={(v) => order.update("appearance", v)}
            />
          )}


          {stepKey === "selections" && (
            <SelectionsStep
              headline={selections.headline}
              groups={selections.groups}
              selections={form.selections}
              quantity={form.quantity}
              quantityRule={selections.quantity}
              isPending={selections.isPending}
              onToggle={order.toggleSelectionValue}
              onQuantityChange={order.setQuantity}
            />
          )}

          {stepKey === "details" && (
            <DetailsStep
              form={form}
              showInspiration={flow.usesCakeBuilder || selections.inspiration}
              {...(selections.inspirationHint
                ? { inspirationHint: selections.inspirationHint }
                : {})}
              /* Shorter workflows ask the occasion here instead of on a stage of its own. */
              showOccasion={!steps.includes("occasion")}
              onOccasionChange={(v) => order.update("occasion", v)}
              onInspirationChange={order.setInspirationFile}
              onEventDateChange={(v) => order.update("eventDate", v)}
              onClearGalleryInspiration={order.clearGalleryReference}
            />
          )}

          {stepKey === "contact" && (
            <>
              <OrderReviewPanel
                form={form}
                productLabel={productFamily(form.product).label}
                {...(sizeLabel ? { sizeLabel } : {})}
                onEdit={() => order.setStep(editStep)}
              />
              <div className="mt-6">
                <ContactStep form={form} onChange={order.update} concept={concept} />
              </div>
            </>
          )}

        </div>

        <div className="flex gap-3 mt-6">
          {(step > 0 || !builder.atStart) && (
            <Button
              variant="outline"
              onClick={goBack}
              className="flex-1 h-12 rounded-full"
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {!order.isLastStep ? (
            <Button
              onClick={goNext}
              className="flex-1 h-12 rounded-full"
              disabled={!canContinue}
            >
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (

            <Button
              onClick={() => submit(form)}
              className="flex-1 h-12 rounded-full"
              disabled={!order.canContinue() || submitting}
            >
              <MessageCircle className="h-4 w-4 mr-2" />{" "}
              {submitting ? "Sending…" : "Send via WhatsApp"}
            </Button>
          )}
        </div>

        {/* Saved Designs hold a cake design, so they follow the cake workflow. */}
        {flow.savesDesigns && (stepKey === "design" || stepKey === "details") && (
          <div className="mt-3 flex">
            <SaveDesignDialog
              form={form}
              designId={edit ? (designId ?? null) : null}
              suggestedName={form.occasion ? `${form.occasion} cake` : "My cake design"}
            />
          </div>
        )}

        {order.isLastStep && !fallbackMessage && (
          <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <Check className="h-3 w-3" /> We'll reply within {BRAND.replyWindow} to confirm
          </p>
        )}

        {/* Shown only when the browser genuinely refused to open WhatsApp. */}
        {fallbackMessage && (
          <div className="surface-card mt-6 rounded-2xl p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Your request was saved, but your browser blocked WhatsApp from opening.
            </p>
            <Button asChild className="mt-4 h-11 w-full rounded-full">
              <a href={whatsappUrl(fallbackMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Open WhatsApp
              </a>
            </Button>
          </div>
        )}


        <div className="mt-10 text-center">
          <Link
            to="/"
            className="eyebrow inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
