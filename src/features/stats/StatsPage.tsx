import { useState } from "react";
import type { Habit } from "../../lib/habit.ts";
import { weekdayNameByIndex } from "../../lib/i18n/index.ts";
import { habitStats, overallStats, RATE_WINDOWS, type Stats } from "../../lib/stats.ts";
import { useI18n } from "../i18n/I18nProvider.tsx";

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

function StatsBlock({
  title,
  stats,
  archived,
}: {
  title: string;
  stats: Stats;
  archived?: boolean;
}) {
  const { t, locale } = useI18n();
  return (
    <section
      aria-label={title}
      className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
    >
      <h3 className="font-semibold">
        {title}
        {archived && (
          <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 text-xs font-normal dark:bg-stone-700">
            {t("stats.archived")}
          </span>
        )}
      </h3>
      {RATE_WINDOWS.map((w) => (
        <RateBar
          key={w}
          label={t("stats.lastDays", { count: w })}
          done={stats.rates[w].done}
          possible={stats.rates[w].possible}
        />
      ))}
      <p className="text-sm text-stone-600 dark:text-stone-400">
        {t("stats.summary", {
          current: stats.currentStreak,
          best: stats.bestStreak,
          day:
            stats.strongestWeekday === null
              ? "–"
              : weekdayNameByIndex(locale, stats.strongestWeekday),
        })}
      </p>
    </section>
  );
}

export function StatsPage({ habits, today }: { habits: Habit[]; today: string }) {
  const { t } = useI18n();
  const [includeArchived, setIncludeArchived] = useState(false);
  if (habits.length === 0) {
    return <p>{t("stats.empty")}</p>;
  }
  const overall = overallStats(
    includeArchived ? habits : habits.filter((habit) => !habit.archived),
    today,
  );
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("stats.heading")}</h2>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeArchived}
          onChange={(event) => setIncludeArchived(event.target.checked)}
        />
        {t("stats.includeArchived")}
      </label>
      <StatsBlock title={t("stats.overall")} stats={overall} />
      {habits.map((habit) => (
        <StatsBlock
          key={habit.id}
          title={habit.name}
          stats={habitStats(habit, today)}
          archived={habit.archived}
        />
      ))}
    </div>
  );
}
