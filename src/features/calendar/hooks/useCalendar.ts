import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createAvailabilityBlock,
  createCalendarEvent,
  createCapacitySetting,
  deleteAvailabilityBlock,
  deleteCalendarEvent,
  deleteCapacitySetting,
  getCalendarRange,
  listCapacitySettings,
  updateCalendarEvent,
  updateCapacitySetting,
} from "../api/calendar.functions";
import type {
  AvailabilityBlockInput,
  CalendarEventInput,
  CapacitySettingInput,
} from "../api/schema";
import type { CalendarRangeData, CapacitySetting } from "../types";

export const calendarKeys = {
  all: ["calendar"] as const,
  range: (from: string, to: string) => ["calendar", "range", from, to] as const,
  capacity: ["calendar", "capacity"] as const,
  availability: (from: string, to: string) =>
    ["calendar", "availability", from, to] as const,
};

/** Admin: events, orders, blocks and workload for one visible range. */
export function useCalendarRange(from: string, to: string) {
  const fetchRange = useServerFn(getCalendarRange);
  return useQuery<CalendarRangeData>({
    queryKey: calendarKeys.range(from, to),
    queryFn: () => fetchRange({ data: { from, to } }),
  });
}

export function useCapacitySettings() {
  const fetchSettings = useServerFn(listCapacitySettings);
  return useQuery<CapacitySetting[]>({
    queryKey: calendarKeys.capacity,
    queryFn: () => fetchSettings({}),
  });
}

/** Shared mutation wiring: invalidate the whole calendar, toast the outcome. */
function useCalendarMutation<TInput>(
  run: (input: TInput) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateCalendarEvent() {
  const mutate = useServerFn(createCalendarEvent);
  return useCalendarMutation(
    (input: CalendarEventInput) => mutate({ data: input }),
    "Event added to the calendar",
  );
}

export function useUpdateCalendarEvent() {
  const mutate = useServerFn(updateCalendarEvent);
  return useCalendarMutation(
    (input: { id: string; values: Partial<CalendarEventInput> }) =>
      mutate({ data: input }),
    "Event updated",
  );
}

export function useDeleteCalendarEvent() {
  const mutate = useServerFn(deleteCalendarEvent);
  return useCalendarMutation((id: string) => mutate({ data: { id } }), "Event removed");
}

export function useCreateAvailabilityBlock() {
  const mutate = useServerFn(createAvailabilityBlock);
  return useCalendarMutation(
    (input: AvailabilityBlockInput) => mutate({ data: input }),
    "Dates blocked",
  );
}

export function useDeleteAvailabilityBlock() {
  const mutate = useServerFn(deleteAvailabilityBlock);
  return useCalendarMutation(
    (id: string) => mutate({ data: { id } }),
    "Dates unblocked",
  );
}

export function useCreateCapacitySetting() {
  const mutate = useServerFn(createCapacitySetting);
  return useCalendarMutation(
    (input: CapacitySettingInput) => mutate({ data: input }),
    "Capacity rule added",
  );
}

export function useUpdateCapacitySetting() {
  const mutate = useServerFn(updateCapacitySetting);
  return useCalendarMutation(
    (input: { id: string; values: Partial<CapacitySettingInput> }) =>
      mutate({ data: input }),
    "Capacity saved",
  );
}

export function useDeleteCapacitySetting() {
  const mutate = useServerFn(deleteCapacitySetting);
  return useCalendarMutation(
    (id: string) => mutate({ data: { id } }),
    "Capacity rule removed",
  );
}
