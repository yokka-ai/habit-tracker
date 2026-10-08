import { useEffect, useRef, useState } from "react";
import { ExportMenu } from "./features/export/ExportMenu.tsx";
import { AddHabitForm } from "./features/habits/AddHabitForm.tsx";
import { ArchivedSection } from "./features/habits/ArchivedSection.tsx";
import { CategoryFilter } from "./features/habits/CategoryFilter.tsx";
import { EmptyState } from "./features/habits/EmptyState.tsx";
import { HabitList } from "./features/habits/HabitList.tsx";
import { useReminders } from "./features/habits/useReminders.ts";
import { YearHeatmap } from "./features/heatmap/YearHeatmap.tsx";
import { I18nProvider, useI18n } from "./features/i18n/I18nProvider.tsx";
import { LanguageSwitcher } from "./features/i18n/LanguageSwitcher.tsx";
import { ImportButton } from "./features/import/ImportButton.tsx";
import { ShortcutsDialog } from "./features/shortcuts/ShortcutsDialog.tsx";
import { useKeyboardShortcuts } from "./features/shortcuts/useKeyboardShortcuts.ts";
import { StatsPage } from "./features/stats/StatsPage.tsx";
import { ThemeToggle } from "./features/theme/ThemeToggle.tsx";
import { useTheme } from "./features/theme/useTheme.ts";
import { WeekView } from "./features/week/WeekView.tsx";
import type { HabitColor } from "./lib/appearance.ts";
import {
  categoriesInUse,
  effectiveFilter,
  filterHabits,
  readStoredCategoryFilter,
  storeCategoryFilter,
} from "./lib/category.ts";
import { today } from "./lib/dates.ts";
import {
  type Appearance,
  activeHabits,
  archivedHabits,
  archiveHabit,
  createHabit,
  editHabit,
  type Habit,
  isCheckedIn,
  moveHabit,
  removeHabit,
  restoreHabit,
  setReminder,
  toggleCheckIn,
} from "./lib/habit.ts";
import { dayLabel } from "./lib/heatmap.ts";
import { ensureNotificationPermission } from "./lib/notifications.ts";
import { loadHabits, saveHabits } from "./lib/storage.ts";

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

function AppContent() {
  const { t, locale } = useI18n();
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);
  useReminders(habits);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const theme = useTheme();
  const [storedFilter, setStoredFilter] = useState(() =>
    readStoredCategoryFilter(window.localStorage),
  );
  const addHabit = (name: string, category?: string, appearance?: Appearance) =>
    setHabits((current) => [...current, createHabit(name, category, appearance)]);

  const edit = (id: string, name: string, category?: string, color?: HabitColor, emoji?: string) =>
    setHabits((c) => editHabit(c, id, { name, category, color, emoji }));
  const active = activeHabits(habits);
  const archived = archivedHabits(habits);
  const categories = categoriesInUse(active);
  const filter = effectiveFilter(active, storedFilter);
  const selectFilter = (category: string) => {
    setStoredFilter(category);
    storeCategoryFilter(window.localStorage, category);
  };
  const remove = (id: string) => setHabits((c) => removeHabit(c, id));
  const move = (id: string, targetId: string) => setHabits((c) => moveHabit(c, id, targetId));
  const [announcement, setAnnouncement] = useState("");
  const toggleDay = (id: string, day: string) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      setAnnouncement(
        t(isCheckedIn(habit, day) ? "announce.unchecked" : "announce.checked", {
          name: habit.name,
          day: day === today() ? t("announce.today") : dayLabel(day, locale),
        }),
      );
    }
    setHabits((c) => toggleCheckIn(c, id, day));
  };
  const toggle = (id: string) => toggleDay(id, today());
  const [view, setView] = useState<"today" | "week">("today");
  const [showStats, setShowStats] = useState(false);
  const visible = filterHabits(active, filter);
  const [helpOpen, setHelpOpen] = useState(false);
  const addFormRef = useRef<HTMLDivElement>(null);
  useKeyboardShortcuts((action) => {
    if (action.type === "focus-new-habit") {
      addFormRef.current?.querySelector<HTMLInputElement>("#habit-name")?.focus();
    } else if (action.type === "toggle-habit") {
      const habit = visible[action.position - 1];
      if (habit) toggle(habit.id);
    } else if (action.type === "show-help") {
      setHelpOpen(true);
    }
  });
  const changeReminder = async (id: string, time: string | undefined) => {
    setHabits((c) => setReminder(c, id, time));
    setReminderNotice(null);
    if (!time) return;
    const permission = await ensureNotificationPermission();
    if (permission === "denied") setReminderNotice(t("reminder.denied"));
    else if (permission === "unsupported") setReminderNotice(t("reminder.unsupported"));
  };
  const archive = (id: string) => setHabits((c) => archiveHabit(c, id));
  const restore = (id: string) => setHabits((c) => restoreHabit(c, id));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-2xl">
            ✅
          </span>
          <h1 className="text-xl font-semibold tracking-tight">{t("app.title")}</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-pressed={showStats}
              onClick={() => setShowStats((s) => !s)}
              className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 aria-pressed:bg-emerald-600 aria-pressed:text-white dark:border-stone-600 dark:hover:bg-stone-800"
            >
              {t("header.stats")}
            </button>
            <ImportButton habits={habits} onReplace={setHabits} />
            <ExportMenu habits={habits} />
            <LanguageSwitcher />
            <ThemeToggle preference={theme.preference} onCycle={theme.cycle} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div ref={addFormRef}>
          <AddHabitForm onAdd={addHabit} />
        </div>
        {reminderNotice ? (
          <p role="alert" className="mb-4 text-sm text-red-700 dark:text-red-400">
            {reminderNotice}
          </p>
        ) : null}
        {showStats ? (
          <StatsPage habits={active} today={today()} />
        ) : active.length === 0 ? (
          <EmptyState onPick={addHabit} />
        ) : (
          <>
            {categories.length > 0 ? (
              <CategoryFilter categories={categories} selected={filter} onSelect={selectFilter} />
            ) : null}
            <fieldset className="mb-4 flex gap-2">
              <legend className="sr-only">{t("view.legend")}</legend>
              {(["today", "week"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 aria-pressed:bg-emerald-600 aria-pressed:text-white dark:border-stone-600 dark:hover:bg-stone-800"
                >
                  {v === "today" ? t("view.today") : t("view.week")}
                </button>
              ))}
            </fieldset>
            {view === "week" ? (
              <WeekView habits={visible} today={today()} onToggleDay={toggleDay} />
            ) : (
              <HabitList
                habits={visible}
                onEdit={edit}
                onDelete={remove}
                onArchive={archive}
                onMove={move}
                onToggle={toggle}
                onSetReminder={changeReminder}
                today={today()}
              />
            )}
            <section aria-labelledby="year-heading" className="mt-10 space-y-4">
              <h2 id="year-heading" className="text-lg font-semibold">
                {t("heatmap.heading")}
              </h2>
              {visible.map((habit) => (
                <YearHeatmap key={habit.id} habit={habit} today={today()} />
              ))}
            </section>
          </>
        )}
        <ArchivedSection habits={archived} onRestore={restore} onDelete={remove} />
      </main>
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
