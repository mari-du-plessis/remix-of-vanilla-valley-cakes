import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AreaField,
  FormActions,
  NativeSelectField,
  TextField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { ORDER_OCCASIONS } from "@/config/occasions";
import { CustomerPickerField } from "@/features/orders/components/CustomerPickerField";
import { ORDER_CHANNEL_LABELS, ORDER_STATUSES } from "@/features/orders/lib/status";
import type { CreateAdminOrderInput } from "@/features/orders/api/schema";
import type { OrderChannel, OrderStatus } from "@/features/orders/types";
import type { Customer } from "@/features/customers/types";

const CHANNEL_OPTIONS = (Object.keys(ORDER_CHANNEL_LABELS) as OrderChannel[]).map((value) => ({
  value,
  label: ORDER_CHANNEL_LABELS[value],
}));

const STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status.value,
  label: status.label,
}));

const OCCASION_OPTIONS = [
  { value: "", label: "— not set —" },
  ...ORDER_OCCASIONS.map((value) => ({ value, label: value })),
];

type ItemDraft = {
  name: string;
  sizeLabel: string;
  quantity: string;
  flavour: string;
  filling: string;
};

const emptyItem = (): ItemDraft => ({
  name: "Custom Cake",
  sizeLabel: "",
  quantity: "1",
  flavour: "",
  filling: "",
});

/**
 * Admin capture for orders that arrive on WhatsApp, the phone, Instagram or in
 * person. Uses the same persistence path as the public wizard so nothing about
 * a manual order behaves differently downstream.
 */
export function ManualOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateAdminOrderInput) => void;
  saving?: boolean;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const { state, set } = useFormState({
    name: "",
    phone: "",
    email: "",
    channel: "whatsapp" as OrderChannel,
    status: "enquiry" as OrderStatus,
    occasion: "",
    eventDate: "",
    customerNotes: "",
    internalNotes: "",
  });

  const name = customer?.name ?? state.name;
  const phone = customer?.phone ?? state.phone;
  const error = !name.trim()
    ? "A customer name is required"
    : phone.trim().length < 6
      ? "A contact number is required"
      : items.every((item) => !item.name.trim())
        ? "Add at least one item"
        : null;

  const setItem = (index: number, key: keyof ItemDraft, value: string) =>
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const reset = () => {
    setCustomer(null);
    setItems([emptyItem()]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>
            Capture an order taken on WhatsApp, the phone, Instagram or in person.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (error) return;
            onSubmit({
              customerId: customer?.id,
              customer: { name, phone, email: customer?.email ?? state.email },
              channel: state.channel,
              status: state.status,
              occasion: state.occasion || undefined,
              eventDate: state.eventDate || "",
              customerNotes: state.customerNotes || undefined,
              internalNotes: state.internalNotes || undefined,
              items: items
                .filter((item) => item.name.trim())
                .map((item) => ({
                  name: item.name.trim(),
                  sizeLabel: item.sizeLabel || undefined,
                  quantity: Math.max(1, Number(item.quantity) || 1),
                  options: [
                    ...(item.flavour
                      ? [
                          {
                            groupKey: "flavour",
                            groupLabel: "Flavour",
                            valueLabel: item.flavour,
                          },
                        ]
                      : []),
                    ...(item.filling
                      ? [
                          {
                            groupKey: "filling",
                            groupLabel: "Filling",
                            valueLabel: item.filling,
                          },
                        ]
                      : []),
                  ],
                })),
            });
            reset();
          }}
        >
          <section className="space-y-3">
            <CustomerPickerField selected={customer} onSelect={setCustomer} />
            {!customer && (
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
                <TextField label="Phone" value={state.phone} onChange={(v) => set("phone", v)} />
                <TextField
                  label="Email (optional)"
                  value={state.email}
                  onChange={(v) => set("email", v)}
                />
              </div>
            )}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <NativeSelectField
              label="Channel"
              value={state.channel}
              onChange={(v) => set("channel", v as OrderChannel)}
              options={CHANNEL_OPTIONS}
            />
            <NativeSelectField
              label="Status"
              value={state.status}
              onChange={(v) => set("status", v as OrderStatus)}
              options={STATUS_OPTIONS}
            />
            <NativeSelectField
              label="Occasion"
              value={state.occasion}
              onChange={(v) => set("occasion", v)}
              options={OCCASION_OPTIONS}
            />
            <TextField
              label="Event date"
              type="date"
              value={state.eventDate}
              onChange={(v) => set("eventDate", v)}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Items</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItems((rows) => [...rows, emptyItem()])}
              >
                Add item
              </Button>
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-border/70 p-3 sm:grid-cols-2"
              >
                <TextField
                  label="Item"
                  value={item.name}
                  onChange={(v) => setItem(index, "name", v)}
                />
                <TextField
                  label="Size"
                  value={item.sizeLabel}
                  onChange={(v) => setItem(index, "sizeLabel", v)}
                />
                <TextField
                  label="Flavour"
                  value={item.flavour}
                  onChange={(v) => setItem(index, "flavour", v)}
                />
                <TextField
                  label="Filling"
                  value={item.filling}
                  onChange={(v) => setItem(index, "filling", v)}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(v) => setItem(index, "quantity", v)}
                />
                {items.length > 1 && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setItems((rows) => rows.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <AreaField
              label="Customer notes"
              value={state.customerNotes}
              onChange={(v) => set("customerNotes", v)}
            />
            <AreaField
              label="Internal notes"
              value={state.internalNotes}
              onChange={(v) => set("internalNotes", v)}
            />
          </section>

          {error && <p className="text-xs text-destructive">{error}</p>}
          <FormActions
            onCancel={() => {
              reset();
              onOpenChange(false);
            }}
            saving={Boolean(error) || saving}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
