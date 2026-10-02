import { useState } from "react";
import { AddHabitForm } from "./features/habits/AddHabitForm.tsx";
import { EmptyState } from "./features/habits/EmptyState.tsx";
import { HabitList } from "./features/habits/HabitList.tsx";
import { ThemeToggle } from "./features/theme/ThemeToggle.tsx";
import { useTheme } from "./features/theme/useTheme.ts";
import { createHabit, type Habit, removeHabit, renameHabit } from "./lib/habit.ts";

export function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const theme = useTheme();
  const addHabit = (name: string) => setHabits((current) => [...current, createHabit(name)]);

  const rename = (id: string, name: string) => setHabits((c) => renameHabit(c, id, name));
  const remove = (id: string) => setHabits((c) => removeHabit(c, id));

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
        <AddHabitForm onAdd={addHabit} />
        {habits.length === 0 ? (
          <EmptyState onPick={addHabit} />
        ) : (
          <HabitList habits={habits} onRename={rename} onDelete={remove} />
        )}
      </main>
    </div>
  );
}
