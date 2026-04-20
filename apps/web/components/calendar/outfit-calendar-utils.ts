import { startOfDay } from "date-fns";

export function dayStartMs(d: Date): number {
  return startOfDay(d).getTime();
}

export function isPastCalendarDay(day: Date, now: Date = new Date()): boolean {
  return dayStartMs(day) < dayStartMs(now);
}

/** True when the user may assign or replace an outfit on this calendar day (today or future). */
export function canAssignOutfitOnDay(
  day: Date,
  now: Date = new Date()
): boolean {
  return dayStartMs(day) >= dayStartMs(now);
}
