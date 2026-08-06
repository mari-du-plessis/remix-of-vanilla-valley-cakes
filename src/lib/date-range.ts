/**
 * Shared helpers for "from date → to date" pickers.
 *
 * Every date range in the app follows the same rule: the end date can never be
 * earlier than the start date. Pickers pass `min={rangeEndMin(from)}` to the
 * native date input and run user input through `clampRangeEnd` so keyboard
 * entry cannot bypass the constraint either.
 */

/** ISO (yyyy-mm-dd) date for today, used as a sensible default minimum. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Minimum allowed value for the "to" input of a range. */
export function rangeEndMin(start: string | null | undefined): string | undefined {
  return start ? start : undefined;
}

/** Keep an end date on/after the start date; empty values stay empty. */
export function clampRangeEnd(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!end) return "";
  if (start && end < start) return start;
  return end;
}

/** True when an ISO date is strictly in the past (day precision). */
export function isPastDate(value: string | null | undefined): boolean {
  if (!value) return false;
  return value < todayIso();
}
