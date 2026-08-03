import type { OrderChannel, OrderStatus } from "../types";

export type OrderStatusMeta = {
  value: OrderStatus;
  label: string;
  description: string;
  /** Tailwind classes for the badge — semantic tokens only. */
  className: string;
};

/**
 * Single source of truth for order lifecycle presentation.
 * Adding a status = adding a row here plus the enum value in the database.
 */
export const ORDER_STATUSES: OrderStatusMeta[] = [
  {
    value: "enquiry",
    label: "Enquiry",
    description: "New request, not yet quoted",
    className: "bg-muted text-muted-foreground border-border",
  },
  {
    value: "quoted",
    label: "Quoted",
    description: "Quotation sent to the customer",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    description: "Customer accepted the quotation",
    className: "bg-accent text-accent-foreground border-border",
  },
  {
    value: "in_production",
    label: "In production",
    description: "Being baked and decorated",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  {
    value: "ready",
    label: "Ready",
    description: "Ready for collection or delivery",
    className: "bg-primary/20 text-primary border-primary/40",
  },
  {
    value: "completed",
    label: "Completed",
    description: "Collected or delivered",
    className: "bg-muted text-foreground border-border",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "No longer going ahead",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
];

export const getStatusMeta = (status: OrderStatus): OrderStatusMeta =>
  ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0];

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  phone: "Phone",
  instagram: "Instagram",
  walk_in: "Walk-in",
};

/** Statuses considered "open work" for dashboards and future calendars. */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "enquiry",
  "quoted",
  "confirmed",
  "in_production",
  "ready",
];
