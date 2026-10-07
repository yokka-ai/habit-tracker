import { describe, expect, it } from "vitest";
import { isFutureDay, weekDays, weekStart } from "./week.ts";

describe("weekStart", () => {
  it("is the Monday of the week", () => {
    expect(weekStart("2026-10-07")).toBe("2026-10-05");
    expect(weekStart("2026-10-05")).toBe("2026-10-05");
  });

  it("treats Sunday as the end of the week", () => {
    expect(weekStart("2026-10-11")).toBe("2026-10-05");
  });
});

describe("weekDays", () => {
  it("lists seven days from Monday", () => {
    expect(weekDays("2026-10-07")).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
  });

  it("crosses month and year boundaries", () => {
    expect(weekDays("2026-12-31")[0]).toBe("2026-12-28");
    expect(weekDays("2026-12-31")[6]).toBe("2027-01-03");
  });

  it("includes 29 February in a leap year", () => {
    expect(weekDays("2028-02-29")).toContain("2028-02-29");
    expect(weekDays("2028-03-01")[0]).toBe("2028-02-28");
  });
});

describe("isFutureDay", () => {
  it("is true only after today", () => {
    expect(isFutureDay("2026-10-08", "2026-10-07")).toBe(true);
    expect(isFutureDay("2026-10-07", "2026-10-07")).toBe(false);
    expect(isFutureDay("2026-10-06", "2026-10-07")).toBe(false);
  });
});
