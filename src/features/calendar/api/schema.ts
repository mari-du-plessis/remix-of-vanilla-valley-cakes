import { z } from "zod";

/** Validation contracts for the calendar module (client + server safe). */

const trimmed = (max: number) => z.string().trim().max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const calendarEventTypeSchema = z.enum([
  "production",
  "collection",
  "delivery",
  "consultation",
  "other",
]);

export const availabilityBlockTypeSchema = z.enum([
  "closure",
  "holiday",
  "fully_booked",
  "custom",
]);

export const dateRangeSchema = z.object({ from: isoDate, to: isoDate });

export const calendarEventInputSchema = z.object({
  orderId: z.string().uuid().nullable().optional(),
  eventType: calendarEventTypeSchema.default("other"),
  title: trimmed(160).min(1, "Title is required"),
  notes: trimmed(2000).optional(),
  location: trimmed(160).optional(),
  startAt: z.string().min(1, "Start time is required"),
  endAt: z.string().optional(),
  allDay: z.boolean().default(false),
});

export const updateCalendarEventSchema = z.object({
  id: z.string().uuid(),
  values: calendarEventInputSchema.partial(),
});

export const idSchema = z.object({ id: z.string().uuid() });

export const availabilityBlockInputSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
    blockType: availabilityBlockTypeSchema.default("closure"),
    reason: trimmed(200).optional(),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const capacitySettingInputSchema = z.object({
  weekday: z.number().int().min(0).max(6).nullable().default(null),
  maxOrdersPerDay: z.number().int().min(0).max(500),
  maxServingsPerDay: z.number().int().min(0).max(100000).nullable().default(null),
  leadTimeDays: z.number().int().min(0).max(365),
  isActive: z.boolean().default(true),
  notes: trimmed(300).optional(),
});

export const updateCapacitySettingSchema = z.object({
  id: z.string().uuid(),
  values: capacitySettingInputSchema.partial(),
});

export type DateRangeInput = z.input<typeof dateRangeSchema>;
export type CalendarEventInput = z.input<typeof calendarEventInputSchema>;
export type AvailabilityBlockInput = z.input<typeof availabilityBlockInputSchema>;
export type CapacitySettingInput = z.input<typeof capacitySettingInputSchema>;
