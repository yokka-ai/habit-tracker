import { addDays, weekday } from "./dates.ts";

/** The Monday of the week containing `day`. */
export function weekStart(day: string): string {
  return addDays(day, -((weekday(day) + 6) % 7));
}

/** The seven days of the week (Monday first) containing `day`. */
export function weekDays(day: string): string[] {
  const start = weekStart(day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Future days can't be checked off. Day strings compare in calendar order. */
export function isFutureDay(day: string, today: string): boolean {
  return day > today;
}
