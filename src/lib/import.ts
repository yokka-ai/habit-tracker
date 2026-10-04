import { DEFAULT_COLOR } from "./appearance.ts";
import { createHabit, type Habit, MAX_HABIT_NAME_LENGTH } from "./habit.ts";
import { STORAGE_VERSION } from "./storage.ts";

type CheckInHabit = Habit & { checkIns?: string[] };

export type ImportSummary = { habits: number; checkIns: number };
export type ImportResult =
  | { ok: true; habits: Habit[]; summary: ImportSummary }
  | { ok: false; error: string };

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

function countCheckIns(habits: Habit[]): number {
  return habits.reduce((n, h) => n + ((h as CheckInHabit).checkIns?.length ?? 0), 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parses a JSON backup made by Export. Anything off refuses the whole file. */
export function parseJsonBackup(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not valid JSON." };
  }
  if (!isRecord(data) || !Array.isArray(data.habits)) {
    return { ok: false, error: "This does not look like a Habit Tracker backup." };
  }
  if (data.version !== STORAGE_VERSION) {
    return { ok: false, error: "This backup was made by an unsupported version." };
  }
  const habits: Habit[] = [];
  for (const [index, item] of data.habits.entries()) {
    const label = `Habit ${index + 1}`;
    if (!isRecord(item)) return { ok: false, error: `${label} is not a valid habit.` };
    if (typeof item.id !== "string" || item.id === "") {
      return { ok: false, error: `${label} has no id.` };
    }
    if (typeof item.name !== "string" || item.name.trim() === "") {
      return { ok: false, error: `${label} has no name.` };
    }
    if (typeof item.createdAt !== "string" || Number.isNaN(Date.parse(item.createdAt))) {
      return { ok: false, error: `${label} has no valid creation date.` };
    }
    if (item.checkIns !== undefined) {
      const days = item.checkIns;
      if (!Array.isArray(days) || !days.every((d) => typeof d === "string" && isValidDay(d))) {
        return { ok: false, error: `${label} has an invalid check-in date.` };
      }
    }
    habits.push(item as unknown as Habit);
  }
  return {
    ok: true,
    habits,
    summary: { habits: habits.length, checkIns: countCheckIns(habits) },
  };
}

/** Splits one CSV line into `[habit, date]`. Handles quoted names; an unquoted name may hold commas. */
function parseCsvLine(line: string): [string, string] | undefined {
  if (line.startsWith('"')) {
    let name = "";
    let i = 1;
    while (i < line.length) {
      if (line[i] === '"') {
        if (line[i + 1] === '"') {
          name += '"';
          i += 2;
          continue;
        }
        break;
      }
      name += line[i];
      i++;
    }
    if (line[i] !== '"' || line[i + 1] !== ",") return undefined;
    return [name, line.slice(i + 2).trim()];
  }
  const comma = line.lastIndexOf(",");
  if (comma === -1) return undefined;
  return [line.slice(0, comma), line.slice(comma + 1).trim()];
}

/** Merges a CSV of `habit,date` rows into existing habits, matched by name. */
export function mergeCsv(text: string, existing: Habit[]): ImportResult {
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  if (lines.length === 0 || lines[0]?.trim() !== "habit,date") {
    return { ok: false, error: 'The first row must be the header "habit,date".' };
  }
  const rows: [string, string][] = [];
  for (const [i, line] of lines.slice(1).entries()) {
    const row = parseCsvLine(line);
    const rowNumber = i + 2;
    if (!row) return { ok: false, error: `Row ${rowNumber} needs a habit and a date.` };
    const name = row[0].trim();
    if (name === "" || name.length > MAX_HABIT_NAME_LENGTH) {
      return { ok: false, error: `Row ${rowNumber} has an invalid habit name.` };
    }
    if (!isValidDay(row[1])) {
      return { ok: false, error: `Row ${rowNumber} has an invalid date "${row[1]}".` };
    }
    rows.push([name, row[1]]);
  }

  const habits: CheckInHabit[] = existing.map((h) => ({ ...h }));
  let created = 0;
  let added = 0;
  for (const [name, date] of rows) {
    let habit = habits.find((h) => h.name === name);
    if (!habit) {
      habit = { ...createHabit(name, undefined, { color: DEFAULT_COLOR }) };
      habits.push(habit);
      created++;
    }
    const days = habit.checkIns ?? [];
    if (!days.includes(date)) {
      habit.checkIns = [...days, date].sort();
      added++;
    }
  }
  return { ok: true, habits, summary: { habits: created, checkIns: added } };
}

export function formatSummary({ habits, checkIns }: ImportSummary): string {
  const h = `${habits} ${habits === 1 ? "habit" : "habits"}`;
  const c = `${checkIns} ${checkIns === 1 ? "check-in" : "check-ins"}`;
  return `Imported ${h}, ${c}`;
}
