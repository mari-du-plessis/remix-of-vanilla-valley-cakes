import { EmptyState, LoadingState } from "@/components/common";
import { CustomerCard } from "./CustomerCard";
import type { Customer } from "../types";

export function CustomerList({
  customers,
  loading,
  error,
  emptyMessage = "No customers yet. New enquiries create customer records automatically.",
}: {
  customers: Customer[] | undefined;
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}) {
  if (loading) return <LoadingState label="Loading customers…" />;
  if (error) return <EmptyState message={`Could not load customers — ${error.message}`} />;
  if (!customers || customers.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}
