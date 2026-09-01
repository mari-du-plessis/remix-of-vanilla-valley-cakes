import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Home, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, Muted } from "@/components/common/Typography";
import { BRAND } from "@/config/brand";
import { SiteShell } from "@/features/site/components/SiteShell";

/**
 * Confirmation after an order is sent. The customer lands here directly —
 * there is no extra "are you sure?" step between WhatsApp and this page.
 */
export const Route = createFileRoute("/order-sent")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } =>
    typeof search["ref"] === "string" && search["ref"] ? { ref: search["ref"] } : {},

  head: () => ({
    meta: [
      { title: "Order Sent — Vanilla Valley Bakery" },
      {
        name: "description",
        content: "Your Vanilla Valley order has been sent. We'll reply on WhatsApp with a quotation.",
      },
      { property: "og:title", content: "Order Sent — Vanilla Valley Bakery" },
      { property: "og:description", content: "We've received your order and will reply shortly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderSentPage,
});

function OrderSentPage() {
  const { ref } = Route.useSearch();

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 text-primary">
          <Check className="h-7 w-7" />
        </span>
        <Eyebrow className="mt-8 text-primary">Order sent</Eyebrow>
        <h1 className="mt-4 text-2xl sm:text-3xl">Thank you — we have your order</h1>
        <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
        {ref && (
          <p className="mt-6 text-sm tracking-[0.14em] text-muted-foreground uppercase">
            Reference {ref}
          </p>
        )}
        <Muted className="mx-auto mt-5 max-w-md">
          We'll reply on WhatsApp within {BRAND.replyWindow} with your quotation. If WhatsApp didn't
          open, message us on {BRAND.whatsappDisplay ?? BRAND.whatsappNumber}.
        </Muted>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full px-8">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Back home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-8">
            <Link to="/gallery">
              <Images className="mr-2 h-4 w-4" /> Browse the gallery
            </Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
