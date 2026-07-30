import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/common";
import { BRAND } from "@/config/brand";
import { ORDER_STEPS } from "@/features/order/types";
import { useOrderForm } from "@/features/order/hooks/useOrderForm";
import { useSubmitOrder } from "@/features/order/hooks/useSubmitOrder";
import { OccasionStep } from "@/features/order/components/OccasionStep";
import { CakeStep } from "@/features/order/components/CakeStep";
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
  const order = useOrderForm();
  const { submit, submitting } = useSubmitOrder();
  const { form, step } = order;

  return (
    <main className="min-h-screen px-6 py-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="text-muted-foreground inline-flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Home
        </Link>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
          {BRAND.name}
        </p>
      </div>

      <StepProgress steps={ORDER_STEPS} current={step} className="mb-8" />

      <div className="bg-card rounded-3xl p-6 border border-border/60 shadow-[var(--shadow-soft)]">
        {step === 0 && (
          <OccasionStep
            value={form.occasion}
            onChange={(o) => order.update("occasion", o)}
          />
        )}

        {step === 1 && (
          <CakeStep
            form={form}
            onSizeChange={order.setSize}
            onFlavourChange={order.setFlavour}
            onFillingChange={(v) => order.update("filling", v)}
            onTierFlavourChange={order.setTierFlavour}
            onTierFieldChange={order.setTierField}
            onToggleExtra={order.toggleExtra}
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
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => order.setStep(step - 1)}
            className="flex-1 h-12 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        {!order.isLastStep ? (
          <Button
            onClick={() =>
              order.canContinue()
                ? order.setStep(step + 1)
                : toast.error("Please complete this step")
            }
            className="flex-1 h-12 rounded-full"
            disabled={!order.canContinue()}
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
    </main>
  );
}
