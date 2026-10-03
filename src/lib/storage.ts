import type { Habit } from "./habit.ts";

export const STORAGE_KEY = "habit-tracker:data";
export const STORAGE_VERSION = 1;

export type StoredData = { version: typeof STORAGE_VERSION; habits: Habit[] };

type Store = Pick<Storage, "getItem" | "setItem">;

function defaultStore(): Store | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Loads saved habits. Missing, corrupt or unknown-version data gives an empty list. */
export function loadHabits(store: Store | undefined = defaultStore()): Habit[] {
  if (!store) return [];
  let raw: string | null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not read saved habits.", error);
    return [];
  }
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data === "object" &&
      data !== null &&
      (data as StoredData).version === STORAGE_VERSION &&
      Array.isArray((data as StoredData).habits)
    ) {
      return (data as StoredData).habits;
    }
    console.warn("Saved habits have an unknown format; starting empty.");
  } catch (error) {
    console.warn("Saved habits are not valid JSON; starting empty.", error);
  }
  return [];
}

/** Saves habits in the versioned format. Returns false if the browser refused. */
export function saveHabits(habits: Habit[], store: Store | undefined = defaultStore()): boolean {
  if (!store) return false;
  const data: StoredData = { version: STORAGE_VERSION, habits };
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Could not save habits.", error);
    return false;
  }
}
