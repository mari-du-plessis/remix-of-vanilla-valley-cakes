import type { OrderListItem } from "@/features/orders/types";

export type CustomerStatus = "lead" | "active" | "vip" | "inactive" | "blocked";
export type ContactChannel = "whatsapp" | "phone" | "email" | "instagram";

/** Aggregates derived from the customer's orders (never stored). */
export type CustomerStats = {
  orderCount: number;
  lastOrderAt: string | null;
  nextEventDate: string | null;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  whatsappPhone: string | null;
  email: string | null;
  status: CustomerStatus;
  preferredChannel: ContactChannel;
  tags: string[];
  notes: string | null;
  marketingOptIn: boolean;
  /** Set once customer accounts ship — the module is already keyed for it. */
  profileId: string | null;
  createdAt: string;
  stats: CustomerStats;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  label: string;
  recipientName: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  deliveryNotes: string | null;
  isDefault: boolean;
};

export type CustomerNote = {
  id: string;
  customerId: string;
  body: string;
  createdAt: string;
};

/** Everything the customer hub screen needs in one read. */
export type CustomerDetail = Customer & {
  addresses: CustomerAddress[];
  noteEntries: CustomerNote[];
  orders: OrderListItem[];
};

export type CustomerSort = "recent" | "name" | "orders" | "last_order";
