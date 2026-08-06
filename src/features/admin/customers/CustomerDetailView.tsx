import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Pencil, UserCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/common";
import { buildWhatsAppLink } from "@/config/brand";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { CustomerAddressPanel } from "@/features/customers/components/CustomerAddressPanel";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { CustomerNotesPanel } from "@/features/customers/components/CustomerNotesPanel";
import { CustomerStatusBadge } from "@/features/customers/components/CustomerStatusBadge";
import { CustomerTagList } from "@/features/customers/components/CustomerTagList";
import {
  CONTACT_CHANNEL_LABELS,
  whatsappNumber,
} from "@/features/customers/lib/customer-meta";
import {
  useAddCustomerNote,
  useCreateAddress,
  useCustomer,
  useDeleteAddress,
  useDeleteCustomerNote,
  useUpdateAddress,
  useUpdateCustomer,
} from "@/features/customers/hooks/useCustomers";
import { OrderList } from "@/features/orders/components/OrderList";
import { formatOrderDate, formatOrderDateTime } from "@/features/orders/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

/**
 * The customer hub: contact details, addresses, notes, order history and the
 * upcoming booking. Every future module (reviews, loyalty, gift cards,
 * accounts) plugs in here as an extra section rather than a new record.
 */
export function CustomerDetailView({ customerId }: { customerId: string }) {
  const { data: customer, isPending, error } = useCustomer(customerId);
  const [editing, setEditing] = useState(false);

  const updateCustomer = useUpdateCustomer();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const addNote = useAddCustomerNote();
  const deleteNote = useDeleteCustomerNote();

  if (isPending) return <LoadingState label="Loading customer…" />;
  if (error || !customer)
    return (
      <EmptyState
        message={
          error ? `Could not load this customer — ${error.message}` : "Customer not found."
        }
        action={
          <Button asChild variant="outline">
            <Link to="/admin/customers">Back to customers</Link>
          </Button>
        }
      />
    );

  const upcoming = customer.orders.filter(
    (order) =>
      order.eventDate &&
      order.eventDate >= new Date().toISOString().slice(0, 10) &&
      !["cancelled", "completed"].includes(order.status),
  );

  return (
    <>
      <Link
        to="/admin/customers"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> All customers
      </Link>

      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${formatOrderDateTime(customer.createdAt)}`}
        action={
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? <X className="mr-1 h-4 w-4" /> : <Pencil className="mr-1 h-4 w-4" />}
            {editing ? "Cancel" : "Edit"}
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {editing && (
            <AdminSection title="Edit customer">
              <CustomerForm
                customer={customer}
                saving={updateCustomer.isPending}
                onCancel={() => setEditing(false)}
                onSubmit={(values) =>
                  updateCustomer.mutate(
                    { id: customer.id, values },
                    { onSuccess: () => setEditing(false) },
                  )
                }
              />
            </AdminSection>
          )}

          <AdminSection
            title="Order history"
            description={`${customer.stats.orderCount} order${customer.stats.orderCount === 1 ? "" : "s"} in total.`}
          >
            <OrderList
              orders={customer.orders}
              emptyMessage="No orders yet for this customer."
            />
          </AdminSection>

          <AdminSection
            title="Delivery addresses"
            description="Saved addresses speed up delivery quotes and future bookings."
          >
            <CustomerAddressPanel
              customerId={customer.id}
              addresses={customer.addresses}
              onCreate={(values) => createAddress.mutate(values)}
              onUpdate={(id, values) => updateAddress.mutate({ id, values })}
              onDelete={(id) => deleteAddress.mutate(id)}
            />
          </AdminSection>

          <AdminSection
            title="Internal notes"
            description="Private staff notes — never shown to the customer."
          >
            <CustomerNotesPanel
              notes={customer.noteEntries}
              saving={addNote.isPending}
              onAdd={(body) => addNote.mutate({ customerId: customer.id, body })}
              onDelete={(id) => deleteNote.mutate(id)}
            />
          </AdminSection>
        </div>

        <div className="space-y-4">
          <AdminSection title="Contact">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Phone</span>
                <span>{customer.phone}</span>
              </div>
              {customer.whatsappPhone && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span>{customer.whatsappPhone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="break-all text-right">{customer.email}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Preferred</span>
                <span>{CONTACT_CHANNEL_LABELS[customer.preferredChannel]}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Marketing</span>
                <span>{customer.marketingOptIn ? "Opted in" : "Not opted in"}</span>
              </div>
            </div>
            <CustomerTagList tags={customer.tags} className="mt-3" />
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <a
                href={buildWhatsAppLink(
                  `Hi ${customer.name}, this is Vanilla Valley…`,
                  whatsappNumber(customer),
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp customer
              </a>
            </Button>
          </AdminSection>

          <AdminSection title="At a glance">
            <div className="grid gap-2">
              <Stat label="Total orders" value={String(customer.stats.orderCount)} />
              <Stat
                label="Last order"
                value={
                  customer.stats.lastOrderAt
                    ? formatOrderDateTime(customer.stats.lastOrderAt)
                    : "—"
                }
              />
              <Stat
                label="Next booking"
                value={
                  customer.stats.nextEventDate
                    ? formatOrderDate(customer.stats.nextEventDate)
                    : "—"
                }
              />
              <Stat label="Lifetime spend" value="Coming with quotations" />
            </div>
          </AdminSection>

          <AdminSection
            title="Upcoming bookings"
            description="Confirmed and in-progress orders with a future event date."
          >
            {upcoming.length === 0 ? (
              <EmptyState message="No upcoming bookings." />
            ) : (
              <ul className="space-y-2 text-sm">
                {upcoming.map((order) => (
                  <li key={order.id} className="flex justify-between gap-3">
                    <Link
                      to="/admin/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="text-muted-foreground">
                      {order.eventDate ? formatOrderDate(order.eventDate) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminSection>

          <AdminSection
            title="Customer account"
            description="Reserved for the upcoming customer login."
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2 className="h-4 w-4" />
              {customer.profileId
                ? "Linked to a customer account"
                : "No linked account yet — this record is already keyed for one."}
            </p>
          </AdminSection>
        </div>
      </div>
    </>
  );
}
