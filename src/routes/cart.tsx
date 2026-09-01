import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common";
import { Eyebrow, Muted } from "@/components/common/Typography";
import { BRAND } from "@/config/brand";
import { SiteShell } from "@/features/site/components/SiteShell";
import { useCart } from "@/features/cart/CartProvider";
import { CartItemCard } from "@/features/cart/components/CartItemCard";
import { useSubmitCart } from "@/features/cart/hooks/useSubmitCart";
import { useServingChart } from "@/features/catalog/hooks/useServingChart";
import { whatsappUrl } from "@/features/order/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Order — Vanilla Valley Bakery" },
      {
        name: "description",
        content:
          "Review everything in your Vanilla Valley order — cakes, cupcakes and treats — then send it to us on WhatsApp for a quotation.",
      },
      { property: "og:title", content: "Your Order — Vanilla Valley Bakery" },
      {
        property: "og:description",
        content: "Review your cakes and treats and send the order to us on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { chart } = useServingChart();
  const { submit, submitting, fallbackMessage } = useSubmitCart();

  const canSend = cart.items.length > 0 && cart.contact.name.trim() && cart.contact.phone.trim();

  const send = async () => {
    const orderNumber = await submit(cart.items, cart.contact);
    if (orderNumber !== null) {
      cart.clear();
      navigate({ to: "/order-sent", search: { ref: orderNumber ?? "" } });
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8 text-center">
          <Eyebrow className="text-primary">Your order</Eyebrow>
          <h1 className="mt-4 text-2xl sm:text-3xl">Everything you're ordering</h1>
          <div className="gold-rule mx-auto mt-5 max-w-[7rem]" />
          <Muted className="mx-auto mt-5 max-w-md">
            Add as many cakes and treats as you like. We'll reply on WhatsApp with a quotation
            within {BRAND.replyWindow}.
          </Muted>
        </header>

        {cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your order is empty"
            description="Start with a custom cake or browse our ready-made treats."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="h-12 rounded-full px-8">
                  <Link to="/order">Start your order</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full px-8">
                  <Link to="/products">Browse treats</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  chart={chart}
                  onQuantityChange={(quantity) => cart.setQuantity(item.id, quantity)}
                  onRemove={() => cart.removeItem(item.id)}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="h-12 flex-1 rounded-full">
                <Link to="/order">
                  <Plus className="mr-2 h-4 w-4" /> Add another cake
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 flex-1 rounded-full">
                <Link to="/products">
                  <Plus className="mr-2 h-4 w-4" /> Add treats
                </Link>
              </Button>
            </div>

            {/* Contact and date are asked once for the whole order. */}
            <section className="surface-card mt-8 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl">Your details</h2>
              <Muted className="mt-2 text-sm">
                So we know who to send the quotation to, and when you need everything.
              </Muted>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="cart-name"
                  label="Your name"
                  required
                  value={cart.contact.name}
                  onChange={(name) => cart.setContact({ name })}
                  placeholder="Thandi Mokoena"
                />
                <Field
                  id="cart-phone"
                  label="WhatsApp number"
                  required
                  type="tel"
                  value={cart.contact.phone}
                  onChange={(phone) => cart.setContact({ phone })}
                  placeholder="082 123 4567"
                />
                <Field
                  id="cart-email"
                  label="Email (optional)"
                  type="email"
                  value={cart.contact.email}
                  onChange={(email) => cart.setContact({ email })}
                  placeholder="you@example.com"
                />
                <Field
                  id="cart-date"
                  label="Date needed"
                  type="date"
                  value={cart.contact.eventDate}
                  onChange={(eventDate) => cart.setContact({ eventDate })}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="cart-notes">Anything else we should know?</Label>
                <Textarea
                  id="cart-notes"
                  rows={3}
                  value={cart.contact.notes}
                  onChange={(event) => cart.setContact({ notes: event.target.value })}
                  placeholder="Delivery address, collection time, allergies…"
                />
              </div>

              <Button
                onClick={send}
                disabled={!canSend || submitting}
                className="mt-6 h-13 w-full rounded-full py-4 text-sm tracking-[0.14em] uppercase"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {submitting ? "Sending…" : "Send order on WhatsApp"}
              </Button>
              {!canSend && cart.items.length > 0 && (
                <Muted className="mt-3 text-center text-xs">
                  Please add your name and WhatsApp number so we can reply.
                </Muted>
              )}
            </section>
          </>
        )}

        {fallbackMessage && (
          <div className="surface-card mt-6 rounded-2xl p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Your order was saved, but your browser blocked WhatsApp from opening.
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

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        {...(placeholder ? { placeholder } : {})}
        onChange={(event) => onChange(event.target.value)}
        className="h-12"
      />
    </div>
  );
}
