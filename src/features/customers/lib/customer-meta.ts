import type { ContactChannel, CustomerStatus } from "../types";

export type CustomerStatusMeta = {
  value: CustomerStatus;
  label: string;
  description: string;
  /** Semantic tokens only — no hardcoded colours. */
  className: string;
};

/**
 * Single source of truth for customer lifecycle presentation. Adding a status
 * = a row here plus the enum value in the database.
 */
export const CUSTOMER_STATUSES: CustomerStatusMeta[] = [
  {
    value: "lead",
    label: "Lead",
    description: "Enquired, not yet ordered",
    className: "bg-muted text-muted-foreground border-border",
  },
  {
    value: "active",
    label: "Active",
    description: "Ordering customer",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  {
    value: "vip",
    label: "VIP",
    description: "Priority customer",
    className: "bg-primary/20 text-primary border-primary/40",
  },
  {
    value: "inactive",
    label: "Inactive",
    description: "No recent orders",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  {
    value: "blocked",
    label: "Blocked",
    description: "Do not accept orders",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
];

export const getCustomerStatusMeta = (status: CustomerStatus): CustomerStatusMeta =>
  CUSTOMER_STATUSES.find((s) => s.value === status) ?? CUSTOMER_STATUSES[0];

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "WhatsApp",
  phone: "Phone",
  email: "Email",
  instagram: "Instagram",
};

export const CUSTOMER_SORTS = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Name (A–Z)" },
  { value: "orders", label: "Most orders" },
  { value: "last_order", label: "Last order" },
] as const;

/** Digits-only number used for WhatsApp deep links. */
export const whatsappNumber = (customer: { phone: string; whatsappPhone?: string | null }) =>
  (customer.whatsappPhone || customer.phone).replace(/\D/g, "");

export const formatAddress = (address: {
  line1: string;
  line2?: string | null;
  suburb?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}) =>
  [address.line1, address.line2, address.suburb, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");
