import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES,
  categoriesInUse,
  effectiveFilter,
  filterHabits,
  MAX_CATEGORY_LENGTH,
  normalizeCategory,
  readStoredCategoryFilter,
  storeCategoryFilter,
} from "./category.ts";
import type { Habit } from "./habit.ts";

const habit = (name: string, category?: string): Habit => ({
  id: name,
  name,
  createdAt: "2026-01-01T00:00:00.000Z",
  color: "emerald",
  ...(category ? { category } : {}),
});

const habits = [
  habit("Drink water", "Health"),
  habit("Read 10 pages", "Mind"),
  habit("Water the plants"),
  habit("Tidy desk", "Zen"),
  habit("Stretch", "health"),
];

describe("normalizeCategory", () => {
  it("trims and treats blank as no category", () => {
    expect(normalizeCategory("  Health ")).toBe("Health");
    expect(normalizeCategory("   ")).toBeUndefined();
    expect(normalizeCategory(undefined)).toBeUndefined();
  });

  it("cuts overly long input", () => {
    expect(normalizeCategory("x".repeat(100))).toHaveLength(MAX_CATEGORY_LENGTH);
  });
});

describe("filterHabits", () => {
  it("returns everything for All, including habits without a category", () => {
    expect(filterHabits(habits, ALL_CATEGORIES)).toHaveLength(5);
  });

  it("shows only the chosen category, ignoring case", () => {
    expect(filterHabits(habits, "Health").map((h) => h.name)).toEqual(["Drink water", "Stretch"]);
  });

  it("never matches habits without a category", () => {
    expect(filterHabits(habits, "Home")).toEqual([]);
  });
});

describe("categoriesInUse", () => {
  it("lists presets first, then custom ones, without duplicates", () => {
    expect(categoriesInUse(habits)).toEqual(["Health", "Mind", "Zen"]);
  });

  it("is empty when no habit has a category", () => {
    expect(categoriesInUse([habit("Drink water")])).toEqual([]);
  });
});

describe("effectiveFilter", () => {
  it("falls back to All when the category is gone", () => {
    expect(effectiveFilter(habits, "Home")).toBe(ALL_CATEGORIES);
    expect(effectiveFilter(habits, "Mind")).toBe("Mind");
  });
});

describe("category filter storage", () => {
  it("round-trips the choice", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    };
    expect(readStoredCategoryFilter(storage)).toBe(ALL_CATEGORIES);
    storeCategoryFilter(storage, "Mind");
    expect(readStoredCategoryFilter(storage)).toBe("Mind");
  });

  it("survives unavailable storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readStoredCategoryFilter(broken)).toBe(ALL_CATEGORIES);
    expect(() => storeCategoryFilter(broken, "Mind")).not.toThrow();
  });
});
