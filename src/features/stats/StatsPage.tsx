import type { Habit } from "../../lib/habit.ts";
import {
  habitStats,
  overallStats,
  RATE_WINDOWS,
  type Stats,
  WEEKDAY_NAMES,
} from "../../lib/stats.ts";

function RateBar({ label, done, possible }: { label: string; done: number; possible: number }) {
  const value = possible === 0 ? null : Math.round((done / possible) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-stone-200 dark:bg-stone-700" aria-hidden="true">
        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${value ?? 0}%` }} />
      </div>
      <span className="w-12 text-right tabular-nums">{value === null ? "–" : `${value}%`}</span>
    </div>
  );
}

function StatsBlock({ title, stats }: { title: string; stats: Stats }) {
  return (
    <section
      aria-label={title}
      className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
    >
      <h3 className="font-semibold">{title}</h3>
      {RATE_WINDOWS.map((w) => (
        <RateBar
          key={w}
          label={`Last ${w} days`}
          done={stats.rates[w].done}
          possible={stats.rates[w].possible}
        />
      ))}
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Current streak {stats.currentStreak} · Best streak {stats.bestStreak} · Strongest day{" "}
        {stats.strongestWeekday === null ? "–" : WEEKDAY_NAMES[stats.strongestWeekday]}
      </p>
    </section>
  );
}

export function StatsPage({ habits, today }: { habits: Habit[]; today: string }) {
  if (habits.length === 0) {
    return <p>No stats yet. Add a habit and check it off to see your numbers.</p>;
  }
  const overall = overallStats(habits, today);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stats</h2>
      <StatsBlock title="Overall" stats={overall} />
      {habits.map((habit) => (
        <StatsBlock key={habit.id} title={habit.name} stats={habitStats(habit, today)} />
      ))}
    </div>
  );
}
