import { afterEach, describe, expect, it, vi } from "vitest";
import { createHabit } from "./habit.ts";
import { loadHabits, STORAGE_KEY, saveHabits } from "./storage.ts";

function fakeStore(initial?: string) {
  const items = new Map<string, string>();
  if (initial !== undefined) items.set(STORAGE_KEY, initial);
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storage", () => {
  it("loads an empty list when nothing is saved", () => {
    expect(loadHabits(fakeStore())).toEqual([]);
  });

  it("saves a versioned object and loads it back", () => {
    const store = fakeStore();
    const habits = [createHabit("Drink water"), createHabit("Read 10 pages")];
    expect(saveHabits(habits, store)).toBe(true);
    expect(JSON.parse(store.items.get(STORAGE_KEY) ?? "")).toEqual({ version: 1, habits });
    expect(loadHabits(store)).toEqual(habits);
  });

  it("loads empty and warns on invalid JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(loadHabits(fakeStore("{not json"))).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it("loads empty and warns on an unknown version", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(loadHabits(fakeStore(JSON.stringify({ version: 99, habits: [] })))).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it("loads empty and warns when habits is not a list", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(loadHabits(fakeStore(JSON.stringify({ version: 1, habits: "nope" })))).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it("reports a failed save instead of throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(saveHabits([], store)).toBe(false);
    expect(warn).toHaveBeenCalled();
  });
});
