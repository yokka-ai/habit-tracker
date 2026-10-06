import { paletteEntry } from "../../lib/appearance.ts";
import { type Habit, isCheckedIn } from "../../lib/habit.ts";
import { buildHeatmapGrid, dayLabel, monthLabels } from "../../lib/heatmap.ts";

type Props = { habit: Habit; today: string };

export function YearHeatmap({ habit, today }: Props) {
  const weeks = buildHeatmapGrid(today);
  const labels = monthLabels(weeks);
  const done = new Set(habit.checkIns ?? []);
  const fill = paletteEntry(habit.color).fill;
  return (
    <section aria-label={`Past year: ${habit.name}`} className="overflow-x-auto">
      <h3 className="mb-1 text-sm font-medium">
        {habit.emoji ? <span aria-hidden="true">{habit.emoji} </span> : null}
        {habit.name}
      </h3>
      <div className="flex gap-0.5">
        {weeks.map((week, index) => (
          <div key={week.find(Boolean) ?? index} className="flex flex-col gap-0.5">
            <span aria-hidden="true" className="h-4 whitespace-nowrap text-[10px] leading-4">
              {labels[index] ? labels[index].slice(0, 3) : ""}
            </span>
            {week.map((day, row) =>
              day ? (
                <span
                  key={day}
                  role="img"
                  title={`${dayLabel(day)}: ${done.has(day) ? "done" : "not done"}`}
                  aria-label={`${dayLabel(day)}: ${isCheckedIn(habit, day) ? "done" : "not done"}`}
                  className={`h-2.5 w-2.5 rounded-sm ${done.has(day) ? fill : "bg-stone-200 dark:bg-stone-800"}`}
                />
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: empty padding cells have no date
                <span key={`pad-${row}`} aria-hidden="true" className="h-2.5 w-2.5" />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
