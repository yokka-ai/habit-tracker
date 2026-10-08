import { addDays, weekday } from "./dates.ts";
import {
  DEFAULT_LOCALE,
  formatDay,
  monthName as i18nMonthName,
  type Locale,
} from "./i18n/index.ts";

export const HEATMAP_DAYS = 365;

/** One column per week (Sunday first), seven rows each; `null` pads days outside the range. */
export type HeatmapWeek = (string | null)[];

/** The last 365 days ending at `end` (inclusive, `YYYY-MM-DD`), laid out in weeks. */
export function buildHeatmapGrid(end: string): HeatmapWeek[] {
  const start = addDays(end, -(HEATMAP_DAYS - 1));
  const padding = weekday(start);
  const cells: (string | null)[] = Array.from({ length: padding }, () => null);
  for (let i = 0; i < HEATMAP_DAYS; i++) cells.push(addDays(start, i));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: HeatmapWeek[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Month name for `day`, e.g. "March". */
export function monthName(day: string, locale: Locale = DEFAULT_LOCALE): string {
  return i18nMonthName(locale, day);
}

/** Human label for a day, e.g. "3 March". */
export function dayLabel(day: string, locale: Locale = DEFAULT_LOCALE): string {
  return formatDay(locale, day);
}

/** For each week, the month name where a new month starts in that column, else `null`. */
export function monthLabels(
  weeks: HeatmapWeek[],
  locale: Locale = DEFAULT_LOCALE,
): (string | null)[] {
  let previous = "";
  return weeks.map((week) => {
    const first = week.find((day): day is string => day !== null);
    if (!first) return null;
    const month = first.slice(0, 7);
    if (month === previous) return null;
    previous = month;
    return monthName(first, locale);
  });
}
