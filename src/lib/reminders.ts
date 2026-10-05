import { today } from "./dates.ts";
import { type Habit, isCheckedIn } from "./habit.ts";

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** True for a local time of day in `HH:MM` (24-hour) form. */
export function isValidTime(value: string): boolean {
  return TIME.test(value);
}

/** Milliseconds from `now` until the next local occurrence of `time` (tomorrow if it has passed). */
export function msUntilNext(time: string, now: Date): number {
  const match = TIME.exec(time);
  if (!match) return Number.POSITIVE_INFINITY;
  const next = new Date(now);
  next.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export type ReminderOptions = {
  /** Called when a reminder is due and the habit is not done today. */
  notify: (habit: Habit) => void;
  now?: () => Date;
};

/**
 * Schedules a timer per active habit with a reminder. Each fires at its time,
 * notifies only if the habit isn't done today, then schedules the next day.
 * Returns a function that cancels everything.
 */
export function scheduleReminders(habits: Habit[], options: ReminderOptions): () => void {
  const now = options.now ?? (() => new Date());
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;

  const schedule = (habit: Habit, time: string) => {
    const timer = setTimeout(
      () => {
        timers.delete(timer);
        if (stopped) return;
        if (!isCheckedIn(habit, today(now()))) options.notify(habit);
        schedule(habit, time);
      },
      msUntilNext(time, now()),
    );
    timers.add(timer);
  };

  for (const habit of habits) {
    if (habit.reminder && !habit.archived && isValidTime(habit.reminder)) {
      schedule(habit, habit.reminder);
    }
  }
  return () => {
    stopped = true;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
  };
}
