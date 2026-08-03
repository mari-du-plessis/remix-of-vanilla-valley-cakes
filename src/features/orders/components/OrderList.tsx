import { EmptyState, LoadingState } from "@/components/common";
import { OrderCard } from "./OrderCard";
import type { OrderListItem } from "../types";

export function OrderList({
  orders,
  loading,
  error,
  emptyMessage = "No orders yet. New enquiries from the order form appear here.",
}: {
  orders: OrderListItem[] | undefined;
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}) {
  if (loading) return <LoadingState label="Loading orders…" />;
  if (error) return <EmptyState message={`Could not load orders — ${error.message}`} />;
  if (!orders || orders.length === 0) return <EmptyState message={emptyMessage} />;


  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
