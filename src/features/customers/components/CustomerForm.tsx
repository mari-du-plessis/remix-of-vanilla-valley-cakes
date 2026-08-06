import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AreaField,
  Field,
  FormActions,
  NativeSelectField,
  TextField,
  ToggleField,
  useFormState,
} from "@/features/admin/catalog/fields";
import { CUSTOMER_STATUSES, CONTACT_CHANNEL_LABELS } from "../lib/customer-meta";
import { CustomerTagList } from "./CustomerTagList";
import type { CustomerInput } from "../api/schema";
import type { Customer } from "../types";

/**
 * One editor for both "add customer" and "edit customer" so the two screens
 * can never drift apart.
 */
export function CustomerForm({
  customer,
  saving,
  onCancel,
  onSubmit,
}: {
  customer?: Customer | null;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (values: CustomerInput) => void;
}) {
  const { state, set } = useFormState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    whatsappPhone: customer?.whatsappPhone ?? "",
    email: customer?.email ?? "",
    status: customer?.status ?? "lead",
    preferredChannel: customer?.preferredChannel ?? "whatsapp",
    tags: customer?.tags ?? ([] as string[]),
    notes: customer?.notes ?? "",
    marketingOptIn: customer?.marketingOptIn ?? false,
  });
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag || state.tags.includes(tag)) return setTagDraft("");
    set("tags", [...state.tags, tag]);
    setTagDraft("");
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...state,
          whatsappPhone: state.whatsappPhone || null,
          email: state.email || null,
          notes: state.notes || null,
        } as CustomerInput);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={state.name} onChange={(v) => set("name", v)} />
        <TextField label="Phone" value={state.phone} onChange={(v) => set("phone", v)} />
        <TextField
          label="WhatsApp number"
          value={state.whatsappPhone}
          placeholder="Leave blank to use the phone number"
          onChange={(v) => set("whatsappPhone", v)}
        />
        <TextField
          label="Email"
          type="email"
          value={state.email}
          onChange={(v) => set("email", v)}
        />
        <NativeSelectField
          label="Status"
          value={state.status}
          onChange={(v) => set("status", v as Customer["status"])}
          options={CUSTOMER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
        <NativeSelectField
          label="Preferred channel"
          value={state.preferredChannel}
          onChange={(v) => set("preferredChannel", v as Customer["preferredChannel"])}
          options={Object.entries(CONTACT_CHANNEL_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>

      <Field label="Tags">
        <div className="flex gap-2">
          <Input
            value={tagDraft}
            maxLength={40}
            placeholder="e.g. wedding, corporate, repeat"
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        <CustomerTagList
          tags={state.tags}
          className="mt-2"
          onRemove={(tag) => set("tags", state.tags.filter((t) => t !== tag))}
        />
      </Field>

      <AreaField
        label="Internal notes (summary)"
        value={state.notes}
        onChange={(v) => set("notes", v)}
      />

      <ToggleField
        label="Happy to receive marketing messages"
        checked={state.marketingOptIn}
        onChange={(v) => set("marketingOptIn", v)}
      />

      <FormActions onCancel={onCancel} saving={saving} />
    </form>
  );
}
