import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSection } from "@/features/admin/components/AdminSection";
import { CustomerFiltersBar } from "@/features/customers/components/CustomerFiltersBar";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { CustomerList } from "@/features/customers/components/CustomerList";
import {
  useCreateCustomer,
  useCustomerTags,
  useCustomers,
} from "@/features/customers/hooks/useCustomers";
import type { CustomerSort, CustomerStatus } from "@/features/customers/types";

/**
 * Customers admin module. The route only mounts this component — all state
 * and data access live in the customers feature.
 */
export function CustomersManager() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<CustomerSort>("recent");
  const [adding, setAdding] = useState(false);

  const { data, isPending, error } = useCustomers({ search, status, tag, sort });
  const { data: tags } = useCustomerTags();
  const createCustomer = useCreateCustomer();

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Every person who has enquired or ordered — contact details, addresses, notes and order history."
        action={
          <Button size="sm" className="rounded-full" onClick={() => setAdding((value) => !value)}>
            {adding ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
            {adding ? "Cancel" : "Add customer"}
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        {adding && (
          <AdminSection
            title="New customer"
            description="Use this for walk-ins and phone enquiries. Website orders create customers automatically."
          >
            <CustomerForm
              saving={createCustomer.isPending}
              onCancel={() => setAdding(false)}
              onSubmit={(values) =>
                createCustomer.mutate(values, { onSuccess: () => setAdding(false) })
              }
            />
          </AdminSection>
        )}

        <CustomerFiltersBar
          search={search}
          status={status}
          tag={tag}
          sort={sort}
          tags={tags ?? []}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onTagChange={setTag}
          onSortChange={setSort}
        />

        <CustomerList
          customers={data}
          loading={isPending}
          error={error as Error | null}
          emptyMessage={
            search || status !== "all" || tag
              ? "No customers match these filters."
              : "No customers yet. New enquiries create customer records automatically."
          }
        />
      </div>
    </>
  );
}
