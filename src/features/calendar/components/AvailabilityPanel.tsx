import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, LoadingState } from "@/components/common";
import { clampRangeEnd, rangeEndMin } from "@/lib/date-range";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { formatOrderDate } from "@/features/orders/lib/format";
import { AVAILABILITY_BLOCK_TYPES, getBlockTypeLabel } from "../lib/event-meta";
import type { AvailabilityBlock, AvailabilityBlockType } from "../types";
import type { AvailabilityBlockInput } from "../api/schema";

/** Block single dates, ranges and holiday closures. */
export function AvailabilityPanel({
  blocks,
  loading,
  onCreate,
  onDelete,
  saving,
}: {
  blocks: AvailabilityBlock[] | undefined;
  loading?: boolean;
  onCreate: (values: AvailabilityBlockInput) => void;
  onDelete: (id: string) => void;
  saving?: boolean;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockType, setBlockType] = useState<AvailabilityBlockType>("closure");
  const [reason, setReason] = useState("");

  const submit = () => {
    if (!startDate) return;
    onCreate({
      startDate,
      endDate: endDate || startDate,
      blockType,
      reason: reason.trim(),
    });
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <AdminSection
      title="Blocked dates"
      description="Close individual days, date ranges and holidays. Blocked days are unavailable to customers."
    >
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="space-y-1.5">
          <Label htmlFor="block-start">From</Label>
          <Input
            id="block-start"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate((current) => clampRangeEnd(e.target.value, current));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block-end">To</Label>
          <Input
            id="block-end"
            type="date"
            value={endDate}
            min={rangeEndMin(startDate)}
            onChange={(e) => setEndDate(clampRangeEnd(startDate, e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block-type">Type</Label>
          <select
            id="block-type"
            value={blockType}
            onChange={(e) => setBlockType(e.target.value as AvailabilityBlockType)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            {AVAILABILITY_BLOCK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="block-reason">Reason</Label>
          <Input
            id="block-reason"
            value={reason}
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Family holiday"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={submit} disabled={!startDate || saving} className="w-full">
            Block dates
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {loading && <LoadingState label="Loading blocked dates…" />}
        {!loading && (!blocks || blocks.length === 0) && (
          <EmptyState message="No blocked dates. The bakery is open on every day within capacity." />
        )}
        {blocks?.map((block) => (
          <div
            key={block.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/70 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">
                {formatOrderDate(block.startDate)}
                {block.endDate !== block.startDate && ` – ${formatOrderDate(block.endDate)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {getBlockTypeLabel(block.blockType)}
                {block.reason ? ` · ${block.reason}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove block"
              onClick={() => onDelete(block.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}
