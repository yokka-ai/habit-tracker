import { describe, expect, it } from "vitest";
import { toCsv, toJson } from "./export.ts";
import type { Habit } from "./habit.ts";
import { isValidDay, mergeCsv, parseJsonBackup } from "./import.ts";

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

describe("isValidDay", () => {
  it("checks real calendar dates", () => {
    expect(isValidDay("2028-02-29")).toBe(true);
    expect(isValidDay("2026-02-29")).toBe(false);
    expect(isValidDay("2026-13-01")).toBe(false);
    expect(isValidDay("2026-1-1")).toBe(false);
  });
});

describe("parseJsonBackup", () => {
  it("round-trips an export", () => {
    const result = parseJsonBackup(toJson([water, read]));
    expect(result).toEqual({
      ok: true,
      habits: [water, read],
      summary: { habits: 2, checkIns: 2 },
    });
  });

  it("refuses malformed files", () => {
    for (const text of [
      "not json",
      "[]",
      '{"version":1}',
      '{"version":2,"habits":[]}',
      '{"version":1,"habits":[5]}',
      '{"version":1,"habits":[{"id":"1","name":"","createdAt":"2026-09-01"}]}',
      '{"version":1,"habits":[{"id":"1","name":"A","createdAt":"nope"}]}',
      '{"version":1,"habits":[{"id":"1","name":"A","createdAt":"2026-09-01","checkIns":["2026-02-30"]}]}',
    ]) {
      const result = parseJsonBackup(text);
      expect(result.ok, text).toBe(false);
    }
  });
});

describe("mergeCsv", () => {
  it("round-trips an export into the same check-ins", () => {
    const result = mergeCsv(toCsv([water]), [{ ...water, checkIns: [] } as Habit]);
    expect(result).toMatchObject({ ok: true, summary: { habits: 0, checkIns: 2 } });
    if (result.ok) expect(result.habits[0]).toEqual(water);
  });

  it("creates missing habits and skips duplicates", () => {
    const csv = "habit,date\nDrink water,2026-09-30\nDrink water,2026-10-02\nStretch,2026-10-01\n";
    const result = mergeCsv(csv, [water]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary).toEqual({ habits: 1, checkIns: 2 });
    expect(result.habits).toHaveLength(2);
    expect((result.habits[0] as typeof water).checkIns).toEqual([
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ]);
    expect(result.habits[1]?.name).toBe("Stretch");
  });

  it("handles quoted names, commas and CRLF", () => {
    const csv = 'habit,date\r\n"Read, ""slowly""",2026-10-01\r\nWalk, then run,2026-10-01\r\n';
    const result = mergeCsv(csv, []);
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.habits.map((h) => h.name)).toEqual(['Read, "slowly"', "Walk, then run"]);
  });

  it("refuses bad files and changes nothing", () => {
    expect(mergeCsv("", [])).toMatchObject({ ok: false });
    expect(mergeCsv("name,day\nA,2026-10-01\n", [])).toMatchObject({ ok: false });
    expect(mergeCsv("habit,date\nA\n", [])).toMatchObject({ ok: false });
    expect(mergeCsv("habit,date\n,2026-10-01\n", [])).toMatchObject({ ok: false });
    expect(mergeCsv("habit,date\nA,2026-02-30\n", [])).toMatchObject({
      ok: false,
      error: { key: "import.error.csvDate", params: { row: 2, date: "2026-02-30" } },
    });
    expect(mergeCsv('habit,date\n"A,2026-10-01\n', [])).toMatchObject({ ok: false });
  });
});
