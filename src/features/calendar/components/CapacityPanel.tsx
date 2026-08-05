import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, LoadingState } from "@/components/common";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { WEEKDAY_NAMES } from "../lib/calendar-range";
import type { CapacitySetting } from "../types";
import type { CapacitySettingInput } from "../api/schema";

const label = (setting: CapacitySetting) =>
  setting.weekday === null ? "Every day (default)" : WEEKDAY_NAMES[setting.weekday];

/**
 * Capacity + lead time editor. One default rule, plus optional per-weekday
 * overrides — the shape future serving-based limits plug into.
 */
export function CapacityPanel({
  settings,
  loading,
  onUpdate,
  onCreate,
  onDelete,
  saving,
}: {
  settings: CapacitySetting[] | undefined;
  loading?: boolean;
  onUpdate: (id: string, values: Partial<CapacitySettingInput>) => void;
  onCreate: (values: CapacitySettingInput) => void;
  onDelete: (id: string) => void;
  saving?: boolean;
}) {
  const [weekday, setWeekday] = useState("6");
  const [maxOrders, setMaxOrders] = useState("3");
  const used = new Set(settings?.map((setting) => setting.weekday));

  return (
    <AdminSection
      title="Capacity & lead time"
      description="How many cakes the bakery can take per day and how much notice an order needs."
    >
      {loading && <LoadingState label="Loading capacity…" />}
      {!loading && (!settings || settings.length === 0) && (
        <EmptyState message="No capacity rules configured yet." />
      )}

      <div className="space-y-3">
        {settings?.map((setting) => (
          <div
            key={setting.id}
            className="grid items-end gap-3 rounded-xl border border-border/70 p-4 sm:grid-cols-5"
          >
            <div className="sm:col-span-2">
              <p className="text-sm font-medium">{label(setting)}</p>
              {setting.notes && (
                <p className="text-xs text-muted-foreground">{setting.notes}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`max-${setting.id}`}>Max cakes / day</Label>
              <Input
                id={`max-${setting.id}`}
                type="number"
                min={0}
                defaultValue={setting.maxOrdersPerDay}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value !== setting.maxOrdersPerDay)
                    onUpdate(setting.id, { maxOrdersPerDay: value });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`lead-${setting.id}`}>Lead time (days)</Label>
              <Input
                id={`lead-${setting.id}`}
                type="number"
                min={0}
                defaultValue={setting.leadTimeDays}
                disabled={setting.weekday !== null}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isFinite(value) && value !== setting.leadTimeDays)
                    onUpdate(setting.id, { leadTimeDays: value });
                }}
              />
            </div>
            <div className="flex justify-end">
              {setting.weekday !== null && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove rule"
                  onClick={() => onDelete(setting.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid items-end gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-weekday">Weekday override</Label>
          <select
            id="new-weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            {WEEKDAY_NAMES.map((name, index) => (
              <option key={name} value={index} disabled={used.has(index)}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-max">Max cakes / day</Label>
          <Input
            id="new-max"
            type="number"
            min={0}
            value={maxOrders}
            onChange={(e) => setMaxOrders(e.target.value)}
          />
        </div>
        <div>
          <Button
            variant="outline"
            disabled={saving || used.has(Number(weekday))}
            onClick={() =>
              onCreate({
                weekday: Number(weekday),
                maxOrdersPerDay: Number(maxOrders) || 0,
                leadTimeDays: settings?.find((s) => s.weekday === null)?.leadTimeDays ?? 3,
              })
            }
          >
            Add override
          </Button>
        </div>
      </div>
    </AdminSection>
  );
}
