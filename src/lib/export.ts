import type { Habit } from "./habit.ts";
import { STORAGE_VERSION, type StoredData } from "./storage.ts";

type ExportableHabit = Habit & { checkIns?: string[] };

/** The JSON backup: the storage object as is. */
export function toJson(habits: Habit[]): string {
  const data: StoredData = { version: STORAGE_VERSION, habits };
  return JSON.stringify(data, null, 2);
}

/** One row per check-in (`habit,date`), after a header row. */
export function toCsv(habits: Habit[]): string {
  const rows = ["habit,date"];
  for (const habit of habits as ExportableHabit[]) {
    for (const date of habit.checkIns ?? []) {
      rows.push(`${habit.name},${date}`);
    }
  }
  return `${rows.join("\n")}\n`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** A dated filename like `habits-2026-10-01.json`, using the local calendar date. */
export function exportFilename(extension: "json" | "csv", now: Date = new Date()): string {
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `habits-${day}.${extension}`;
}
