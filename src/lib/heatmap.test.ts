import { describe, expect, it } from "vitest";
import { buildHeatmapGrid, dayLabel, HEATMAP_DAYS, monthLabels } from "./heatmap.ts";

function days(end: string) {
  return buildHeatmapGrid(end)
    .flat()
    .filter((d): d is string => d !== null);
}

describe("buildHeatmapGrid", () => {
  it("covers exactly 365 consecutive days ending on the end date", () => {
    const all = days("2026-10-06");
    expect(all).toHaveLength(HEATMAP_DAYS);
    expect(all[0]).toBe("2025-10-07");
    expect(all.at(-1)).toBe("2026-10-06");
    expect(new Set(all).size).toBe(HEATMAP_DAYS);
  });

  it("has at most 53 weeks of 7 rows", () => {
    for (const end of ["2026-10-04", "2026-10-06", "2026-10-10", "2028-02-29"]) {
      const weeks = buildHeatmapGrid(end);
      expect(weeks.length).toBeLessThanOrEqual(53);
      for (const week of weeks) expect(week).toHaveLength(7);
    }
  });

  it("pads the first week when the year starts mid-week", () => {
    // 2025-10-07 is a Tuesday: Sunday and Monday are empty.
    const [first] = buildHeatmapGrid("2026-10-06");
    expect(first?.slice(0, 3)).toEqual([null, null, "2025-10-07"]);
  });

  it("pads the last week after the end date", () => {
    // 2026-10-06 is a Tuesday.
    const last = buildHeatmapGrid("2026-10-06").at(-1);
    expect(last).toEqual(["2026-10-04", "2026-10-05", "2026-10-06", null, null, null, null]);
  });

  it("starts on a Sunday with no padding when it can", () => {
    // Ending on a Sunday: start is a Sunday too.
    const [first] = buildHeatmapGrid("2026-10-04");
    expect(first?.[0]).toBe("2025-10-05");
  });

  it("keeps all days around a leap day", () => {
    const all = days("2028-03-10");
    expect(all).toContain("2028-02-29");
    expect(all).toHaveLength(HEATMAP_DAYS);
  });
});

describe("monthLabels", () => {
  it("labels the column where each month starts", () => {
    const weeks = buildHeatmapGrid("2026-10-06");
    const labels = monthLabels(weeks);
    expect(labels).toHaveLength(weeks.length);
    expect(labels[0]).toBe("October");
    expect(labels.filter(Boolean)).toHaveLength(13);
    expect(labels.at(-1)).toBe("October");
  });
});

describe("dayLabel", () => {
  it("writes day and month name", () => {
    expect(dayLabel("2026-03-03")).toBe("3 March");
  });
});
