import type { Habit } from "./habit.ts";

export const PRESET_CATEGORIES = ["Health", "Mind", "Work", "Home"] as const;

export const MAX_CATEGORY_LENGTH = 24;

export const CATEGORY_FILTER_STORAGE_KEY = "habit-tracker:category-filter";

/** The filter value that shows every habit. */
export const ALL_CATEGORIES = "";

/** Trims a category; blank means "no category". Too-long input is cut to the limit. */
export function normalizeCategory(input: string | undefined): string | undefined {
  const category = (input ?? "").trim().slice(0, MAX_CATEGORY_LENGTH).trim();
  return category.length === 0 ? undefined : category;
}

function sameCategory(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** Categories in use: presets first (in preset order), then custom ones alphabetically. */
export function categoriesInUse(habits: Habit[]): string[] {
  const found: string[] = [];
  for (const habit of habits) {
    if (habit.category && !found.some((c) => sameCategory(c, habit.category as string))) {
      found.push(habit.category);
    }
  }
  const presets = PRESET_CATEGORIES.flatMap((preset) =>
    found.filter((c) => sameCategory(c, preset)),
  );
  const custom = found
    .filter((c) => !PRESET_CATEGORIES.some((preset) => sameCategory(c, preset)))
    .sort((a, b) => a.localeCompare(b));
  return [...presets, ...custom];
}

export function filterHabits(habits: Habit[], filter: string): Habit[] {
  if (filter === ALL_CATEGORIES) return habits;
  return habits.filter(
    (habit) => habit.category !== undefined && sameCategory(habit.category, filter),
  );
}

/** A remembered filter whose category no longer exists falls back to All. */
export function effectiveFilter(habits: Habit[], filter: string): string {
  return categoriesInUse(habits).some((c) => sameCategory(c, filter)) ? filter : ALL_CATEGORIES;
}

export function readStoredCategoryFilter(storage: Pick<Storage, "getItem">): string {
  try {
    return normalizeCategory(storage.getItem(CATEGORY_FILTER_STORAGE_KEY) ?? "") ?? ALL_CATEGORIES;
  } catch {
    return ALL_CATEGORIES;
  }
}

export function storeCategoryFilter(storage: Pick<Storage, "setItem">, filter: string) {
  try {
    storage.setItem(CATEGORY_FILTER_STORAGE_KEY, filter);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit only.
  }
}
