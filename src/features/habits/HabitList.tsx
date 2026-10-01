import type { Habit } from "../../lib/habit.ts";

type Props = { habits: Habit[] };

export function HabitList({ habits }: Props) {
  return (
    <ul aria-label="Habits" className="space-y-2">
      {habits.map((habit) => (
        <li key={habit.id} className="rounded-lg border border-stone-200 bg-white px-4 py-3">
          {habit.name}
        </li>
      ))}
    </ul>
  );
}
