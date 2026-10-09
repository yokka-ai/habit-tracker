import { useEffect } from "react";
import { today } from "../../lib/dates.ts";
import type { Habit } from "../../lib/habit.ts";
import { translator } from "../../lib/i18n/index.ts";
import { showReminder } from "../../lib/notifications.ts";
import { claimReminder } from "../../lib/reminder-claims.ts";
import { scheduleReminders } from "../../lib/reminders.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

/** Shows a notification at each habit's reminder time while the app is open. */
export function useReminders(habits: Habit[]) {
  const { locale } = useI18n();
  useEffect(() => {
    const t = translator(locale);
    return scheduleReminders(habits, {
      notify: (habit) => {
        const day = today();
        if (!claimReminder(habit.id, day)) return;
        showReminder(
          t("reminder.title", { name: habit.name }),
          t("reminder.body"),
          `${habit.id}:${day}`,
        );
      },
    });
  }, [habits, locale]);
}
