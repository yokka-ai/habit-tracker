import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createHabit } from "../../lib/habit.ts";
import { YearHeatmap } from "./YearHeatmap.tsx";

const habit = { ...createHabit("Drink water"), checkIns: ["2026-03-03", "2026-10-06"] };

describe("YearHeatmap", () => {
  it("labels done and not-done days", () => {
    render(<YearHeatmap habit={habit} today="2026-10-06" />);
    expect(screen.getByRole("img", { name: "3 March: done" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "6 October: done" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4 March: not done" })).toBeInTheDocument();
  });

  it("renders one cell per day of the past year", () => {
    render(<YearHeatmap habit={habit} today="2026-10-06" />);
    expect(screen.getAllByRole("img")).toHaveLength(365);
  });

  it("is a named section", () => {
    render(<YearHeatmap habit={habit} today="2026-10-06" />);
    expect(screen.getByRole("region", { name: "Past year: Drink water" })).toBeInTheDocument();
  });
});
