import { describe, expect, it } from "vitest";
import type { Habit } from "./habit.ts";
import {
  completionRate,
  createdDay,
  habitStats,
  overallStats,
  percent,
  strongestWeekday,
} from "./stats.ts";

const habit = (createdAt: string, checkIns: string[] = []): Habit => ({
  id: createdAt,
  name: "Drink water",
  createdAt,
  color: "emerald",
  checkIns,
});

describe("completionRate", () => {
  it("counts done days over the window", () => {
    const r = completionRate(["2026-10-05", "2026-10-06"], "2026-01-01", "2026-10-07", 7);
    expect(r).toEqual({ done: 2, possible: 7 });
  });

  it("does not count days before the habit was created as missed", () => {
    const r = completionRate(["2026-10-06"], "2026-10-05", "2026-10-07", 30);
    expect(r).toEqual({ done: 1, possible: 3 });
  });

  it("ignores check-ins outside the window", () => {
    const r = completionRate(["2026-09-01", "2026-10-07"], "2026-01-01", "2026-10-07", 7);
    expect(r.done).toBe(1);
  });

  it("has no possible days for a habit created after today", () => {
    expect(completionRate([], "2026-10-08", "2026-10-07", 7)).toEqual({ done: 0, possible: 0 });
  });

  it("handles a 365-day window across a leap day", () => {
    const r = completionRate([], "2020-01-01", "2024-03-01", 365);
    expect(r.possible).toBe(365);
    expect(completionRate([], "2024-02-28", "2024-03-01", 30).possible).toBe(3);
  });
});

describe("strongestWeekday", () => {
  it("is null without check-ins", () => {
    expect(strongestWeekday([], "2026-10-01", "2026-10-07")).toBeNull();
  });

  it("picks the weekday with the best rate", () => {
    // 2026-10-05 is a Monday; created on the 5th, two Mondays and one of each other weekday.
    const days = ["2026-10-05", "2026-10-12"];
    expect(strongestWeekday(days, "2026-10-05", "2026-10-18")).toBe(1);
  });

  it("uses rates, not raw counts", () => {
    // Mondays 5th, 12th, 19th; Tuesdays 6th, 13th. Tuesday: 1/2, Monday: 1/3.
    expect(strongestWeekday(["2026-10-05", "2026-10-06"], "2026-10-05", "2026-10-19")).toBe(2);
  });
});

describe("habitStats", () => {
  it("combines rates and streaks", () => {
    const h = habit("2026-10-01T09:00:00", ["2026-10-06", "2026-10-07"]);
    const s = habitStats(h, "2026-10-07");
    expect(s.currentStreak).toBe(2);
    expect(s.bestStreak).toBe(2);
    expect(s.rates[7]).toEqual({ done: 2, possible: 7 });
    expect(createdDay(h)).toBe("2026-10-01");
  });
});

describe("overallStats", () => {
  it("is empty with no habits", () => {
    const s = overallStats([], "2026-10-07");
    expect(s.rates[7]).toEqual({ done: 0, possible: 0 });
    expect(s.strongestWeekday).toBeNull();
    expect(s.currentStreak).toBe(0);
  });

  it("sums habits and joins their days", () => {
    const a = habit("2026-10-06T09:00:00", ["2026-10-06"]);
    const b = habit("2026-10-07T09:00:00", ["2026-10-07"]);
    const s = overallStats([a, b], "2026-10-07");
    expect(s.rates[7]).toEqual({ done: 2, possible: 3 });
    expect(s.currentStreak).toBe(2);
  });
});

describe("percent", () => {
  it("rounds and handles no days", () => {
    expect(percent({ done: 1, possible: 3 })).toBe(33);
    expect(percent({ done: 0, possible: 0 })).toBeNull();
  });
});
