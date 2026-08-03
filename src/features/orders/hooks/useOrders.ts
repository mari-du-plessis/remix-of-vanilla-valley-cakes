import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderNotes,
  updateOrderStatus,
} from "../api/orders.functions";
import type { CreateOrderInput } from "../api/schema";
import type { OrderDetail, OrderListItem, OrderStatus } from "../types";

export const orderKeys = {
  all: ["orders"] as const,
  list: (status: OrderStatus | "all", search: string) =>
    ["orders", "list", status, search] as const,
  detail: (orderId: string) => ["orders", "detail", orderId] as const,
};

/** Admin list of orders with server-side status filtering. */
export function useOrders(status: OrderStatus | "all" = "all", search = "") {
  const fetchOrders = useServerFn(listOrders);
  return useQuery<OrderListItem[]>({
    queryKey: orderKeys.list(status, search),
    queryFn: () => fetchOrders({ data: { status, search } }),
  });
}

/** Admin detail view: items, options and status history. */
export function useOrder(orderId: string) {
  const fetchOrder = useServerFn(getOrder);
  return useQuery<OrderDetail>({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrder({ data: { orderId } }),
  });
}

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();
  const mutate = useServerFn(updateOrderStatus);
  return useMutation({
    mutationFn: (status: OrderStatus) => mutate({ data: { orderId, status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Order status updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateOrderNotes(orderId: string) {
  const queryClient = useQueryClient();
  const mutate = useServerFn(updateOrderNotes);
  return useMutation({
    mutationFn: (internalNotes: string) => mutate({ data: { orderId, internalNotes } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success("Notes saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/**
 * Persists a customer enquiry. Used by the public order wizard; deliberately
 * separate from the WhatsApp step so one can never block the other.
 */
export function useCreateOrder() {
  const mutate = useServerFn(createOrder);
  return useMutation({
    mutationFn: (input: CreateOrderInput) => mutate({ data: input }),
  });
}
