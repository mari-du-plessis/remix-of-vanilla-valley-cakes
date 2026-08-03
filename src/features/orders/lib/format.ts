import { format, parseISO } from "date-fns";

const safeParse = (value: string) => {
  try {
    return parseISO(value);
  } catch {
    return null;
  }
};

/** Event / calendar dates (date-only strings). */
export const formatOrderDate = (value: string) => {
  const date = safeParse(value);
  return date && !Number.isNaN(date.getTime()) ? format(date, "d MMM yyyy") : value;
};

/** Timestamps in the audit trail. */
export const formatOrderDateTime = (value: string) => {
  const date = safeParse(value);
  return date && !Number.isNaN(date.getTime()) ? format(date, "d MMM yyyy, HH:mm") : value;
};
