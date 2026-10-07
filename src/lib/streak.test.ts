import { describe, expect, it } from "vitest";
import { bestStreak, currentStreak } from "./streak.ts";

describe("currentStreak", () => {
  it("is 0 with no check-ins", () => {
    expect(currentStreak(undefined, "2026-10-05")).toBe(0);
    expect(currentStreak([], "2026-10-05")).toBe(0);
  });

  it("counts a single day done today", () => {
    expect(currentStreak(["2026-10-05"], "2026-10-05")).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-10-03", "2026-10-04", "2026-10-05"], "2026-10-05")).toBe(3);
  });

  it("keeps yesterday's streak when today isn't done yet", () => {
    expect(currentStreak(["2026-10-03", "2026-10-04"], "2026-10-05")).toBe(2);
  });

  it("is 0 once a full day is missed", () => {
    expect(currentStreak(["2026-10-02", "2026-10-03"], "2026-10-05")).toBe(0);
  });

  it("stops at a gap", () => {
    expect(currentStreak(["2026-10-01", "2026-10-04", "2026-10-05"], "2026-10-05")).toBe(2);
  });

  it("crosses month, year and leap-day boundaries", () => {
    expect(currentStreak(["2023-12-31", "2024-01-01"], "2024-01-01")).toBe(2);
    expect(currentStreak(["2024-02-28", "2024-02-29", "2024-03-01"], "2024-03-01")).toBe(3);
  });

  it("isn't affected by daylight saving changes", () => {
    expect(currentStreak(["2026-03-28", "2026-03-29", "2026-03-30"], "2026-03-30")).toBe(3);
    expect(currentStreak(["2026-10-24", "2026-10-25", "2026-10-26"], "2026-10-26")).toBe(3);
  });
});

describe("bestStreak", () => {
  it("is 0 with no check-ins", () => {
    expect(bestStreak(undefined)).toBe(0);
    expect(bestStreak([])).toBe(0);
  });

  it("is 1 for a single day", () => {
    expect(bestStreak(["2026-10-05"])).toBe(1);
  });

  it("finds the longest run across gaps", () => {
    expect(bestStreak(["2026-09-01", "2026-09-02", "2026-09-10", "2026-09-11", "2026-09-12"])).toBe(
      3,
    );
  });

  it("counts runs across a leap day", () => {
    expect(bestStreak(["2024-02-28", "2024-02-29", "2024-03-01"])).toBe(3);
  });

  it("ignores duplicates and order", () => {
    expect(bestStreak(["2026-10-02", "2026-10-01", "2026-10-01"])).toBe(2);
  });
});
