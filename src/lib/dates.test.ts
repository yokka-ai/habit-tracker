import { describe, expect, it } from "vitest";
import { isValidDay, toDay, today } from "./dates.ts";

describe("toDay", () => {
  it("uses the local calendar date, zero-padded", () => {
    expect(toDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(toDay(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });

  it("handles leap days", () => {
    expect(toDay(new Date(2028, 1, 29, 12))).toBe("2028-02-29");
  });
});

describe("today", () => {
  it("formats the given moment", () => {
    expect(today(new Date(2026, 9, 5, 8))).toBe("2026-10-05");
  });

  it("defaults to the current day", () => {
    expect(isValidDay(today())).toBe(true);
  });
});
