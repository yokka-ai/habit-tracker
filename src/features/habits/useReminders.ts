import { useEffect } from "react";
import type { Habit } from "../../lib/habit.ts";
import { showReminder } from "../../lib/notifications.ts";
import { scheduleReminders } from "../../lib/reminders.ts";

/** Shows a notification at each habit's reminder time while the app is open. */
export function useReminders(habits: Habit[]) {
  useEffect(
    () => scheduleReminders(habits, { notify: (habit) => showReminder(habit.name) }),
    [habits],
  );
}
