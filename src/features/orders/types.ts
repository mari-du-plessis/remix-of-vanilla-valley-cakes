import type { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderChannel = Database["public"]["Enums"]["order_channel"];

export type OrderCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

/** One chosen option on a line item (flavour, filling, extra, tier flavour…). */
export type OrderItemOption = {
  id: string;
  groupKey: string;
  groupLabel: string;
  valueLabel: string;
  tierIndex: number | null;
};

export type OrderItem = {
  id: string;
  name: string;
  sizeLabel: string | null;
  quantity: number;
  options: OrderItemOption[];
};

/** Row shape used by the admin list — intentionally light. */
export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  channel: OrderChannel;
  occasion: string | null;
  eventDate: string | null;
  createdAt: string;
  customer: OrderCustomer | null;
};

export type OrderStatusEvent = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string | null;
  createdAt: string;
};

export type OrderDetail = OrderListItem & {
  customerNotes: string | null;
  internalNotes: string | null;
  inspirationUrl: string | null;
  aiPreviewUrl: string | null;
  summary: string | null;
  items: OrderItem[];
  history: OrderStatusEvent[];
};

/** Filters supported by the admin orders list. */
export type OrderFilters = {
  status?: OrderStatus | "all";
  search?: string;
};
