import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createCustomer,
  createCustomerAddress,
  createCustomerNote,
  deleteCustomer,
  deleteCustomerAddress,
  deleteCustomerNote,
  getCustomer,
  listCustomerTags,
  listCustomers,
  updateCustomer,
  updateCustomerAddress,
} from "../api/customers.functions";
import type { AddressInput, CustomerInput, ListCustomersInput } from "../api/schema";
import type { Customer, CustomerDetail } from "../types";

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: Partial<ListCustomersInput>) => ["customers", "list", filters] as const,
  detail: (customerId: string) => ["customers", "detail", customerId] as const,
  tags: ["customers", "tags"] as const,
};

export function useCustomers(filters: Partial<ListCustomersInput>) {
  const fetchCustomers = useServerFn(listCustomers);
  return useQuery<Customer[]>({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers({ data: filters }),
  });
}

export function useCustomer(customerId: string) {
  const fetchCustomer = useServerFn(getCustomer);
  return useQuery<CustomerDetail>({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => fetchCustomer({ data: { customerId } }),
  });
}

export function useCustomerTags() {
  const fetchTags = useServerFn(listCustomerTags);
  return useQuery<string[]>({ queryKey: customerKeys.tags, queryFn: () => fetchTags({}) });
}

/** Shared mutation wiring: invalidate all customer queries, toast the outcome. */
function useCustomerMutation<TInput>(
  run: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateCustomer() {
  const mutate = useServerFn(createCustomer);
  return useCustomerMutation((input: CustomerInput) => mutate({ data: input }), "Customer added");
}

export function useUpdateCustomer() {
  const mutate = useServerFn(updateCustomer);
  return useCustomerMutation(
    (input: { id: string; values: Partial<CustomerInput> }) => mutate({ data: input }),
    "Customer updated",
  );
}

export function useDeleteCustomer() {
  const mutate = useServerFn(deleteCustomer);
  return useCustomerMutation((id: string) => mutate({ data: { id } }), "Customer removed");
}

export function useCreateAddress() {
  const mutate = useServerFn(createCustomerAddress);
  return useCustomerMutation((input: AddressInput) => mutate({ data: input }), "Address added");
}

export function useUpdateAddress() {
  const mutate = useServerFn(updateCustomerAddress);
  return useCustomerMutation(
    (input: { id: string; values: Partial<Omit<AddressInput, "customerId">> }) =>
      mutate({ data: input }),
    "Address updated",
  );
}

export function useDeleteAddress() {
  const mutate = useServerFn(deleteCustomerAddress);
  return useCustomerMutation((id: string) => mutate({ data: { id } }), "Address removed");
}

export function useAddCustomerNote() {
  const mutate = useServerFn(createCustomerNote);
  return useCustomerMutation(
    (input: { customerId: string; body: string }) => mutate({ data: input }),
    "Note added",
  );
}

export function useDeleteCustomerNote() {
  const mutate = useServerFn(deleteCustomerNote);
  return useCustomerMutation((id: string) => mutate({ data: { id } }), "Note removed");
}
