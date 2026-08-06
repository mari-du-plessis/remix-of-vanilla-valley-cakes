import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { CatalogCrudList } from "@/features/admin/catalog/CatalogCrudList";
import {
  AreaField,
  FormActions,
  TextField,
  ToggleField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { formatAddress } from "../lib/customer-meta";
import type { AddressInput } from "../api/schema";
import type { CustomerAddress } from "../types";

function AddressForm({
  address,
  customerId,
  onCancel,
  onSubmit,
}: {
  address: CustomerAddress | null;
  customerId: string;
  onCancel: () => void;
  onSubmit: (values: AddressInput) => void;
}) {
  const { state, set } = useFormState({
    label: address?.label ?? "Delivery",
    recipientName: address?.recipientName ?? "",
    phone: address?.phone ?? "",
    line1: address?.line1 ?? "",
    line2: address?.line2 ?? "",
    suburb: address?.suburb ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    postalCode: address?.postalCode ?? "",
    country: address?.country ?? "South Africa",
    deliveryNotes: address?.deliveryNotes ?? "",
    isDefault: address?.isDefault ?? false,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...state, customerId } as AddressInput);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Label" value={state.label} onChange={(v) => set("label", v)} />
        <TextField
          label="Recipient"
          value={state.recipientName}
          onChange={(v) => set("recipientName", v)}
        />
        <TextField label="Phone" value={state.phone} onChange={(v) => set("phone", v)} />
        <TextField label="Street address" value={state.line1} onChange={(v) => set("line1", v)} />
        <TextField label="Complex / unit" value={state.line2} onChange={(v) => set("line2", v)} />
        <TextField label="Suburb" value={state.suburb} onChange={(v) => set("suburb", v)} />
        <TextField label="City" value={state.city} onChange={(v) => set("city", v)} />
        <TextField label="Province" value={state.province} onChange={(v) => set("province", v)} />
        <TextField
          label="Postal code"
          value={state.postalCode}
          onChange={(v) => set("postalCode", v)}
        />
        <TextField label="Country" value={state.country} onChange={(v) => set("country", v)} />
      </div>
      <AreaField
        label="Delivery notes"
        value={state.deliveryNotes}
        onChange={(v) => set("deliveryNotes", v)}
      />
      <ToggleField
        label="Default delivery address"
        checked={state.isDefault}
        onChange={(v) => set("isDefault", v)}
      />
      <FormActions onCancel={onCancel} />
    </form>
  );
}

export function CustomerAddressPanel({
  customerId,
  addresses,
  onCreate,
  onUpdate,
  onDelete,
}: {
  customerId: string;
  addresses: CustomerAddress[];
  onCreate: (values: AddressInput) => void;
  onUpdate: (id: string, values: Partial<Omit<AddressInput, "customerId">>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <CatalogCrudList
      rows={addresses}
      addLabel="Add delivery address"
      emptyMessage="No saved delivery addresses yet."
      onDelete={(row) => onDelete(row.id)}
      renderRow={(row) => (
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium">
            {row.label}
            {row.isDefault && <Star className="h-3 w-3 text-primary" aria-label="Default" />}
          </p>
          <p className="truncate text-sm text-muted-foreground">{formatAddress(row)}</p>
          {row.deliveryNotes && (
            <p className="truncate text-xs text-muted-foreground">{row.deliveryNotes}</p>
          )}
        </div>
      )}
      renderForm={(row, close) => (
        <AddressForm
          address={row}
          customerId={customerId}
          onCancel={close}
          onSubmit={(values) => {
            if (row) {
              const { customerId: _ignored, ...rest } = values;
              onUpdate(row.id, rest);
            } else {
              onCreate(values);
            }
            close();
          }}
        />
      )}
    />
  );
}

export { AddressForm };
