import type { AvailabilityBlockType, CalendarEventType } from "../types";

export type EventTypeMeta = {
  value: CalendarEventType;
  label: string;
  /** Semantic-token classes only — never raw colours. */
  className: string;
};

/** Single source of truth for calendar event presentation. */
export const CALENDAR_EVENT_TYPES: EventTypeMeta[] = [
  {
    value: "production",
    label: "Production",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  {
    value: "collection",
    label: "Collection",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  {
    value: "delivery",
    label: "Delivery",
    className: "bg-accent text-accent-foreground border-border",
  },
  {
    value: "consultation",
    label: "Consultation",
    className: "bg-muted text-muted-foreground border-border",
  },
  {
    value: "other",
    label: "Other",
    className: "bg-muted text-foreground border-border",
  },
];

export const getEventTypeMeta = (type: CalendarEventType): EventTypeMeta =>
  CALENDAR_EVENT_TYPES.find((meta) => meta.value === type) ?? CALENDAR_EVENT_TYPES[4];

export const AVAILABILITY_BLOCK_TYPES: {
  value: AvailabilityBlockType;
  label: string;
}[] = [
  { value: "closure", label: "Closure" },
  { value: "holiday", label: "Holiday" },
  { value: "fully_booked", label: "Fully booked" },
  { value: "custom", label: "Custom" },
];

export const getBlockTypeLabel = (type: AvailabilityBlockType) =>
  AVAILABILITY_BLOCK_TYPES.find((meta) => meta.value === type)?.label ?? "Blocked";
