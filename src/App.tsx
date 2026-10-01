import { useState } from "react";
import { AddHabitForm } from "./features/habits/AddHabitForm.tsx";
import { HabitList } from "./features/habits/HabitList.tsx";
import { ThemeToggle } from "./features/theme/ThemeToggle.tsx";
import { useTheme } from "./features/theme/useTheme.ts";
import { createHabit, type Habit } from "./lib/habit.ts";

export function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const theme = useTheme();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-2xl">
            ✅
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Habit Tracker</h1>
          <ThemeToggle preference={theme.preference} onCycle={theme.cycle} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <AddHabitForm onAdd={(name) => setHabits((current) => [...current, createHabit(name)])} />
        {habits.length === 0 ? (
          <section
            aria-labelledby="empty-title"
            className="rounded-xl border border-dashed border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900 px-6 py-16 text-center"
          >
            <h2 id="empty-title" className="text-lg font-medium">
              No habits yet
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Habits you track will show up here. This app is being built live by AI coding agents,
              one ticket at a time.
            </p>
          </section>
        ) : (
          <HabitList habits={habits} />
        )}
      </main>
    </div>
  );
}
