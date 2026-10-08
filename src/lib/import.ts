import { DEFAULT_COLOR } from "./appearance.ts";
import { isValidDay } from "./dates.ts";

export { isValidDay };

import { createHabit, type Habit, MAX_HABIT_NAME_LENGTH } from "./habit.ts";
import type { Message } from "./i18n/index.ts";
import { STORAGE_VERSION } from "./storage.ts";

type CheckInHabit = Habit;

export type ImportSummary = { habits: number; checkIns: number };
export type ImportResult =
  | { ok: true; habits: Habit[]; summary: ImportSummary }
  | { ok: false; error: Message };

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
    return { ok: false, error: { key: "import.error.notJson" } };
  }
  if (!isRecord(data) || !Array.isArray(data.habits)) {
    return { ok: false, error: { key: "import.error.notBackup" } };
  }
  if (data.version !== STORAGE_VERSION) {
    return { ok: false, error: { key: "import.error.version" } };
  }
  const habits: Habit[] = [];
  for (const [index, item] of data.habits.entries()) {
    const n = index + 1;
    if (!isRecord(item))
      return { ok: false, error: { key: "import.error.habitInvalid", params: { n } } };
    if (typeof item.id !== "string" || item.id === "") {
      return { ok: false, error: { key: "import.error.habitNoId", params: { n } } };
    }
    if (typeof item.name !== "string" || item.name.trim() === "") {
      return { ok: false, error: { key: "import.error.habitNoName", params: { n } } };
    }
    if (typeof item.createdAt !== "string" || Number.isNaN(Date.parse(item.createdAt))) {
      return { ok: false, error: { key: "import.error.habitNoDate", params: { n } } };
    }
    if (item.checkIns !== undefined) {
      const days = item.checkIns;
      if (!Array.isArray(days) || !days.every((d) => typeof d === "string" && isValidDay(d))) {
        return { ok: false, error: { key: "import.error.habitCheckIn", params: { n } } };
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
    return { ok: false, error: { key: "import.error.csvHeader" } };
  }
  const rows: [string, string][] = [];
  for (const [i, line] of lines.slice(1).entries()) {
    const row = parseCsvLine(line);
    const rowNumber = i + 2;
    if (!row)
      return { ok: false, error: { key: "import.error.csvRow", params: { row: rowNumber } } };
    const name = row[0].trim();
    if (name === "" || name.length > MAX_HABIT_NAME_LENGTH) {
      return { ok: false, error: { key: "import.error.csvName", params: { row: rowNumber } } };
    }
    if (!isValidDay(row[1])) {
      return {
        ok: false,
        error: { key: "import.error.csvDate", params: { row: rowNumber, date: row[1] } },
      };
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
