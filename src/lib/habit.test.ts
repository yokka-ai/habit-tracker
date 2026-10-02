import { describe, expect, it } from "vitest";
import {
  createHabit,
  MAX_HABIT_NAME_LENGTH,
  removeHabit,
  renameHabit,
  validateHabitName,
} from "./habit.ts";

describe("validateHabitName", () => {
  it("trims the name", () => {
    expect(validateHabitName("  Drink water  ")).toEqual({ ok: true, name: "Drink water" });
  });

  it("refuses empty and whitespace names", () => {
    expect(validateHabitName("").ok).toBe(false);
    expect(validateHabitName("   ").ok).toBe(false);
  });

  it("allows exactly the maximum length and refuses longer", () => {
    expect(validateHabitName("a".repeat(MAX_HABIT_NAME_LENGTH)).ok).toBe(true);
    expect(validateHabitName("a".repeat(MAX_HABIT_NAME_LENGTH + 1)).ok).toBe(false);
  });
});

describe("createHabit", () => {
  it("creates a habit with a unique id and timestamp", () => {
    const a = createHabit("Read 10 pages", new Date("2026-01-02T03:04:05Z"));
    const b = createHabit("Read 10 pages");
    expect(a.name).toBe("Read 10 pages");
    expect(a.createdAt).toBe("2026-01-02T03:04:05.000Z");
    expect(a.id).not.toBe(b.id);
  });
});

describe("renameHabit and removeHabit", () => {
  const a = { id: "a", name: "Drink water", createdAt: "2026-01-01T00:00:00.000Z" };
  const b = { id: "b", name: "Read 10 pages", createdAt: "2026-01-02T00:00:00.000Z" };

  it("renames only the matching habit", () => {
    expect(renameHabit([a, b], "b", "Stretch")).toEqual([a, { ...b, name: "Stretch" }]);
  });

  it("removes only the matching habit", () => {
    expect(removeHabit([a, b], "a")).toEqual([b]);
  });
});
