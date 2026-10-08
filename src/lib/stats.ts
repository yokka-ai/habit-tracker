import { addDays, toDay, weekday } from "./dates.ts";
import type { Habit } from "./habit.ts";
import { bestStreak, currentStreak } from "./streak.ts";

export const RATE_WINDOWS = [7, 30, 365] as const;

export type Rate = { done: number; possible: number };

export type Stats = {
  rates: Record<(typeof RATE_WINDOWS)[number], Rate>;
  currentStreak: number;
  bestStreak: number;
  /** Weekday (0 = Sunday) with the highest completion rate, or null with no check-ins. */
  strongestWeekday: number | null;
};

/** The local day a habit was created. */
export function createdDay(habit: Pick<Habit, "createdAt">): string {
  return toDay(new Date(habit.createdAt));
}

/** Number of days from `from` to `to`, both included; 0 when `from` is after `to`. */
function daysBetween(from: string, to: string): number {
  const [a, b] = [from, to].map((d) => Date.parse(`${d}T00:00:00Z`)) as [number, number];
  return Math.max(0, Math.round((b - a) / 86_400_000) + 1);
}

/** Completion over the last `window` days. Days before the habit existed don't count as missed. */
export function completionRate(
  checkIns: readonly string[] | undefined,
  created: string,
  today: string,
  window: number,
): Rate {
  const windowStart = addDays(today, -(window - 1));
  const start = created > windowStart ? created : windowStart;
  const possible = daysBetween(start, today);
  const done = new Set((checkIns ?? []).filter((d) => d >= start && d <= today)).size;
  return { done, possible };
}

/** The weekday with the highest completion rate since creation; ties go to the earliest in the week. */
export function strongestWeekday(
  checkIns: readonly string[] | undefined,
  created: string,
  today: string,
): number | null {
  const done = new Set((checkIns ?? []).filter((d) => d >= created && d <= today));
  if (done.size === 0) return null;
  const doneBy = Array<number>(7).fill(0);
  const possibleBy = Array<number>(7).fill(0);
  for (const day of done) doneBy[weekday(day)] = (doneBy[weekday(day)] ?? 0) + 1;
  const total = daysBetween(created, today);
  for (let i = 0; i < Math.min(total, 7); i += 1) {
    const day = addDays(created, i);
    possibleBy[weekday(day)] = Math.floor((total - i - 1) / 7) + 1;
  }
  let best: number | null = null;
  let bestRate = -1;
  for (let w = 0; w < 7; w += 1) {
    const possible = possibleBy[w] ?? 0;
    if (possible === 0) continue;
    const rate = (doneBy[w] ?? 0) / possible;
    if (rate > bestRate) {
      best = w;
      bestRate = rate;
    }
  }
  return best;
}

export function habitStats(habit: Habit, today: string): Stats {
  const created = createdDay(habit);
  return {
    rates: {
      7: completionRate(habit.checkIns, created, today, 7),
      30: completionRate(habit.checkIns, created, today, 30),
      365: completionRate(habit.checkIns, created, today, 365),
    },
    currentStreak: currentStreak(habit.checkIns, today),
    bestStreak: bestStreak(habit.checkIns),
    strongestWeekday: strongestWeekday(habit.checkIns, created, today),
  };
}

/** Totals across habits; streaks count days on which any habit was done. */
export function overallStats(habits: readonly Habit[], today: string): Stats {
  const sum = (window: (typeof RATE_WINDOWS)[number]): Rate =>
    habits.reduce<Rate>(
      (acc, habit) => {
        const r = completionRate(habit.checkIns, createdDay(habit), today, window);
        return { done: acc.done + r.done, possible: acc.possible + r.possible };
      },
      { done: 0, possible: 0 },
    );
  const anyDay = [...new Set(habits.flatMap((h) => h.checkIns ?? []))].sort();
  const counts = Array<number>(7).fill(0);
  let possible = 0;
  const perWeekday = Array<Rate>(7)
    .fill({ done: 0, possible: 0 })
    .map(() => ({ done: 0, possible: 0 }));
  for (const habit of habits) {
    const created = createdDay(habit);
    const total = daysBetween(created, today);
    for (let i = 0; i < Math.min(total, 7); i += 1) {
      const slot = perWeekday[weekday(addDays(created, i))];
      if (slot) slot.possible += Math.floor((total - i - 1) / 7) + 1;
    }
    for (const day of new Set(habit.checkIns ?? [])) {
      if (day >= created && day <= today) {
        const slot = perWeekday[weekday(day)];
        if (slot) slot.done += 1;
        counts[weekday(day)] = (counts[weekday(day)] ?? 0) + 1;
        possible += 1;
      }
    }
  }
  let strongest: number | null = null;
  let bestRate = -1;
  if (possible > 0) {
    perWeekday.forEach((slot, w) => {
      if (slot.possible === 0) return;
      const rate = slot.done / slot.possible;
      if (rate > bestRate) {
        strongest = w;
        bestRate = rate;
      }
    });
  }
  return {
    rates: { 7: sum(7), 30: sum(30), 365: sum(365) },
    currentStreak: currentStreak(anyDay, today),
    bestStreak: bestStreak(anyDay),
    strongestWeekday: strongest,
  };
}

/** Whole-number percent, or null when no days count yet. */
export function percent(rate: Rate): number | null {
  return rate.possible === 0 ? null : Math.round((rate.done / rate.possible) * 100);
}
