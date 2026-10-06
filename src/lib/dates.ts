const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date in `YYYY-MM-DD` form (leap years included). */
export function isValidDay(value: string): boolean {
  const match = DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** The user's local calendar date for `date`, as `YYYY-MM-DD`. */
export function toDay(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function today(now: Date = new Date()): string {
  return toDay(now);
}

function toUtc(day: string): Date {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, date));
}

function fromUtc(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The calendar day `count` days after `day` (negative for before). Not affected by DST. */
export function addDays(day: string, count: number): string {
  const date = toUtc(day);
  date.setUTCDate(date.getUTCDate() + count);
  return fromUtc(date);
}

/** Weekday of `day`, 0 (Sunday) to 6 (Saturday). */
export function weekday(day: string): number {
  return toUtc(day).getUTCDay();
}
