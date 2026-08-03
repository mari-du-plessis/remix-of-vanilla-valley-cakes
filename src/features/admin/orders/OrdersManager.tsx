import { useState } from "react";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { OrderFiltersBar } from "@/features/orders/components/OrderFiltersBar";
import { OrderList } from "@/features/orders/components/OrderList";
import { useOrders } from "@/features/orders/hooks/useOrders";
import type { OrderStatus } from "@/features/orders/types";

/**
 * Orders admin module. All state and data access live in the orders feature —
 * the route only mounts this component.
 */
export function OrdersManager() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { data, isPending, error } = useOrders(status, search);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every customer enquiry, quotation and confirmed order in one place."
      />
      <div className="mt-6 space-y-6">
        <OrderFiltersBar
          status={status}
          search={search}
          onStatusChange={setStatus}
          onSearchChange={setSearch}
        />
        <OrderList
          orders={data}
          loading={isPending}
          error={error as Error | null}
          emptyMessage={
            status === "all" && !search
              ? "No orders yet. New enquiries from the order form appear here."
              : "No orders match these filters."
          }
        />
      </div>
    </>
  );
}
