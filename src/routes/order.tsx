import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/common";
import { Eyebrow } from "@/components/common/Typography";
import { SiteShell } from "@/features/site/components/SiteShell";
import { BRAND } from "@/config/brand";
import { ORDER_STEPS } from "@/features/order/types";
import { useCakeCatalog } from "@/features/catalog/hooks/useCakeCatalog";
import { useOrderForm } from "@/features/order/hooks/useOrderForm";
import { useSubmitOrder } from "@/features/order/hooks/useSubmitOrder";
import { useGuidedBuilder } from "@/features/cake-builder/hooks/useGuidedBuilder";
import { GuidedCakeBuilder } from "@/features/cake-builder/components/GuidedCakeBuilder";
import { OccasionStep } from "@/features/order/components/OccasionStep";
import { DetailsStep } from "@/features/order/components/DetailsStep";
import { ContactStep } from "@/features/order/components/ContactStep";


export const Route = createFileRoute("/order")({
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
  const order = useOrderForm(catalog);
  const { submit, submitting } = useSubmitOrder();
  const { form, step } = order;

  /**
   * The cake builder owns its own sub-steps; the wizard's Back/Continue simply
   * drive them while the customer is designing, so there is only ever one set
   * of navigation on screen.
   */
  const builder = useGuidedBuilder(form, catalog, order);
  const designing = step === 1;
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
          <h1 className="mt-4 text-2xl sm:text-3xl">Design your cake</h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
        </div>

        <StepProgress steps={ORDER_STEPS} current={step} className="mb-8" />

        <div className="surface-card rounded-3xl p-6 sm:p-8">
          {step === 0 && (
            <OccasionStep value={form.occasion} onChange={(o) => order.update("occasion", o)} />
          )}

          {designing && (
            <GuidedCakeBuilder
              form={form}
              catalog={catalog}
              builder={builder}
              onCakeTextChange={(v) => order.update("cakeText", v)}
            />
          )}

          {step === 2 && (
            <DetailsStep
              form={form}
              onInspirationChange={order.setInspirationFile}
              onEventDateChange={(v) => order.update("eventDate", v)}
            />
          )}

          {step === 3 && <ContactStep form={form} onChange={order.update} />}
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

        {order.isLastStep && (
          <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <Check className="h-3 w-3" /> We'll reply within {BRAND.replyWindow} to confirm
          </p>
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
