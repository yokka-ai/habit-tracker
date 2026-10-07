import { useState } from "react";
import { paletteEntry } from "../../lib/appearance.ts";
import { addDays } from "../../lib/dates.ts";
import { type Habit, isCheckedIn } from "../../lib/habit.ts";
import { dayLabel } from "../../lib/heatmap.ts";
import { isFutureDay, weekDays } from "../../lib/week.ts";

type Props = {
  habits: Habit[];
  today: string;
  onToggleDay: (id: string, day: string) => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const navClass =
  "rounded-lg border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-600 dark:hover:bg-stone-800";

export function WeekView({ habits, today, onToggleDay }: Props) {
  const [anchor, setAnchor] = useState(today);
  const days = weekDays(anchor);
  const first = days[0] as string;
  const last = days[6] as string;
  return (
    <section aria-label="Week" className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" className={navClass} onClick={() => setAnchor(addDays(anchor, -7))}>
          Previous week
        </button>
        <p className="flex-1 text-center text-sm font-medium" aria-live="polite">
          {dayLabel(first)} to {dayLabel(last)}
        </p>
        <button type="button" className={navClass} onClick={() => setAnchor(addDays(anchor, 7))}>
          Next week
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-left font-medium">
                Habit
              </th>
              {days.map((day, i) => (
                <th key={day} scope="col" className="w-12 text-center font-medium">
                  <span aria-hidden="true">{WEEKDAYS[i]}</span>
                  <span className="sr-only">{dayLabel(day)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <th scope="row" className="py-1 pr-2 text-left font-normal">
                  {habit.emoji ? <span aria-hidden="true">{habit.emoji} </span> : null}
                  {habit.name}
                </th>
                {days.map((day) => {
                  const done = isCheckedIn(habit, day);
                  const future = isFutureDay(day, today);
                  return (
                    <td key={day} className="text-center">
                      <button
                        type="button"
                        aria-pressed={done}
                        disabled={future}
                        aria-label={`${habit.name}, ${dayLabel(day)}`}
                        onClick={() => onToggleDay(habit.id, day)}
                        className={`h-8 w-8 rounded-md border border-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-600 ${done ? `${paletteEntry(habit.color).fill} text-white` : ""}`}
                      >
                        <span aria-hidden="true">{done ? "✓" : ""}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
