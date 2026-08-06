import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, LoadingState } from "@/components/common";
import { buildWhatsAppLink } from "@/config/brand";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { OrderItemsSummary } from "@/features/orders/components/OrderItemsSummary";
import { OrderStatusSelect } from "@/features/orders/components/OrderStatusSelect";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { formatOrderDate, formatOrderDateTime } from "@/features/orders/lib/format";
import { ORDER_CHANNEL_LABELS } from "@/features/orders/lib/status";
import {
  useOrder,
  useUpdateOrderNotes,
  useUpdateOrderStatus,
} from "@/features/orders/hooks/useOrders";
import type { OrderStatus } from "@/features/orders/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="admin-heading mb-4 text-xs text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { data: order, isPending, error } = useOrder(orderId);
  const statusMutation = useUpdateOrderStatus(orderId);
  const notesMutation = useUpdateOrderNotes(orderId);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (order) setNotes(order.internalNotes ?? "");
  }, [order?.id, order?.internalNotes]);

  if (isPending) return <LoadingState label="Loading order…" />;
  if (error || !order)
    return (
      <EmptyState
        message={error ? `Could not load this order — ${error.message}` : "Order not found."}
        action={
          <Button asChild variant="outline">
            <Link to="/admin/orders">Back to orders</Link>
          </Button>
        }
      />
    );

  return (
    <>
      <Link
        to="/admin/orders"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All orders
      </Link>

      <AdminPageHeader
        title={order.orderNumber}
        description={`${ORDER_CHANNEL_LABELS[order.channel]} enquiry · received ${formatOrderDateTime(order.createdAt)}`}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Cake details">
            <OrderItemsSummary items={order.items} />
            {order.customerNotes && (
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                “{order.customerNotes}”
              </p>
            )}
            {order.inspirationUrl && (
              <a
                href={order.inspirationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary"
              >
                Inspiration photo <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Section>

          <Section title="Internal notes">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={4000}
              rows={5}
              placeholder="Private notes — never shown to the customer."
            />
            <Button
              className="mt-3"
              size="sm"
              disabled={notesMutation.isPending || notes === (order.internalNotes ?? "")}
              onClick={() => notesMutation.mutate(notes)}
            >
              {notesMutation.isPending ? "Saving…" : "Save notes"}
            </Button>
          </Section>

          <Section title="History">
            <OrderTimeline history={order.history} />
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Status">
            <OrderStatusSelect
              value={order.status}
              onChange={(next) => statusMutation.mutate(next as OrderStatus)}
              disabled={statusMutation.isPending}
              className="w-full"
            />
          </Section>

          <Section title="Customer">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer?.name ?? "Unknown"}</p>
              {order.customer?.phone && (
                <p className="text-muted-foreground">{order.customer.phone}</p>
              )}
              {order.customer?.email && (
                <p className="text-muted-foreground break-all">{order.customer.email}</p>
              )}
            </div>
            {order.customer?.phone && (
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <a
                  href={buildWhatsAppLink(
                    `Hi ${order.customer.name}, about your order ${order.orderNumber}…`,
                    order.customer.phone.replace(/\D/g, ""),
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp customer
                </a>
              </Button>
            )}
          </Section>

          <Section title="Event">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Occasion</dt>
                <dd>{order.occasion ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Event date</dt>
                <dd>{order.eventDate ? formatOrderDate(order.eventDate) : "—"}</dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </>
  );
}
