import { addDays } from "./dates.ts";

/**
 * Consecutive days done, ending today or yesterday. A streak isn't broken until a
 * full day is missed, so an undone today doesn't reset it.
 */
export function currentStreak(checkIns: readonly string[] | undefined, today: string): number {
  const days = new Set(checkIns ?? []);
  let day = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(day)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

/** The longest run of consecutive days in `checkIns`. */
export function bestStreak(checkIns: readonly string[] | undefined): number {
  const days = [...new Set(checkIns ?? [])].sort();
  let best = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of days) {
    run = previous !== undefined && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}
