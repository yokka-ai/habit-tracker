import { describe, expect, it } from "vitest";
import { exportFilename, toCsv, toJson } from "./export.ts";
import type { Habit } from "./habit.ts";

const water: Habit & { checkIns: string[] } = {
  id: "1",
  name: "Drink water",
  createdAt: "2026-09-01T08:00:00.000Z",
  color: "emerald",
  checkIns: ["2026-09-30", "2026-10-01"],
};
const read: Habit = {
  id: "2",
  name: "Read 10 pages",
  createdAt: "2026-09-02T08:00:00.000Z",
  color: "emerald",
};

describe("toJson", () => {
  it("writes the storage object", () => {
    expect(JSON.parse(toJson([water, read]))).toEqual({ version: 1, habits: [water, read] });
  });
});

describe("toCsv", () => {
  it("has a header and one row per check-in", () => {
    expect(toCsv([water, read])).toBe(
      "habit,date\nDrink water,2026-09-30\nDrink water,2026-10-01\n",
    );
  });

  it("is just the header with no check-ins", () => {
    expect(toCsv([read])).toBe("habit,date\n");
  });
});

describe("exportFilename", () => {
  it("uses the local date", () => {
    expect(exportFilename("json", new Date(2026, 9, 1, 23, 59))).toBe("habits-2026-10-01.json");
    expect(exportFilename("csv", new Date(2028, 1, 29))).toBe("habits-2028-02-29.csv");
  });
});
