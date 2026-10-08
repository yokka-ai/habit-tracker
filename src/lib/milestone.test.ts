import { describe, expect, it } from "vitest";
import { reachedMilestone } from "./milestone.ts";

describe("reachedMilestone", () => {
  it.each([
    [6, 7],
    [29, 30],
    [99, 100],
  ])("reports a streak growing from %i to %i", (previous, next) => {
    expect(reachedMilestone(previous, next)).toBe(next);
  });

  it("stays quiet between milestones", () => {
    expect(reachedMilestone(7, 8)).toBeNull();
    expect(reachedMilestone(0, 1)).toBeNull();
  });

  it("stays quiet when the streak did not grow", () => {
    expect(reachedMilestone(7, 7)).toBeNull();
    expect(reachedMilestone(7, 6)).toBeNull();
  });
});
