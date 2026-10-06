import { describe, expect, it } from "vitest";
import { addDays, isValidDay, toDay, today, weekday } from "./dates.ts";

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

describe("addDays", () => {
  it("crosses month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("handles leap days", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2028-02-29", 1)).toBe("2028-03-01");
    expect(addDays("2028-03-01", -366)).toBe("2027-03-01");
  });
});

describe("weekday", () => {
  it("returns 0 for Sunday", () => {
    expect(weekday("2026-10-04")).toBe(0);
    expect(weekday("2026-10-06")).toBe(2);
  });
});
