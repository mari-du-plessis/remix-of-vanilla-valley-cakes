import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CALENDAR_EVENT_TYPES } from "../lib/event-meta";
import type { CalendarEvent, CalendarEventType } from "../types";
import type { CalendarEventInput } from "../api/schema";

type FormState = {
  title: string;
  eventType: CalendarEventType;
  date: string;
  time: string;
  allDay: boolean;
  location: string;
  notes: string;
};

const emptyForm = (date: Date): FormState => ({
  title: "",
  eventType: "production",
  date: format(date, "yyyy-MM-dd"),
  time: "09:00",
  allDay: false,
  location: "",
  notes: "",
});

const fromEvent = (event: CalendarEvent): FormState => {
  const start = new Date(event.startAt);
  return {
    title: event.title,
    eventType: event.eventType,
    date: format(start, "yyyy-MM-dd"),
    time: format(start, "HH:mm"),
    allDay: event.allDay,
    location: event.location ?? "",
    notes: event.notes ?? "",
  };
};

/**
 * Create / edit dialog for manual calendar events. Order-linked events are
 * derived automatically, so this only handles bakery-created entries.
 */
export function CalendarEventDialog({
  open,
  onOpenChange,
  defaultDate,
  event,
  onSubmit,
  onDelete,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: Date;
  event?: CalendarEvent | null;
  onSubmit: (values: CalendarEventInput) => void;
  onDelete?: (id: string) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<FormState>(emptyForm(defaultDate));

  useEffect(() => {
    if (!open) return;
    setForm(event ? fromEvent(event) : emptyForm(defaultDate));
  }, [open, event, defaultDate]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) return;
    const startAt = new Date(
      `${form.date}T${form.allDay ? "00:00" : form.time}:00`,
    ).toISOString();
    onSubmit({
      title: form.title.trim(),
      eventType: form.eventType,
      startAt,
      allDay: form.allDay,
      location: form.location.trim(),
      notes: form.notes.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "New calendar event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={form.title}
              maxLength={160}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Bake wedding tiers"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-type">Type</Label>
              <select
                id="event-type"
                value={form.eventType}
                onChange={(e) => set("eventType", e.target.value as CalendarEventType)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                {CALENDAR_EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="event-time">Time</Label>
              <Input
                id="event-time"
                type="time"
                value={form.time}
                disabled={form.allDay}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => set("allDay", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              All day
            </label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={form.location}
              maxLength={160}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Bakery, customer address…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-notes">Notes</Label>
            <Textarea
              id="event-notes"
              value={form.notes}
              maxLength={2000}
              rows={3}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {event && onDelete ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(event.id)}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving || !form.title.trim()}>
              {event ? "Save changes" : "Add event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
