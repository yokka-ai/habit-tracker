import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Habit } from "../../lib/habit.ts";
import { StatsPage } from "./StatsPage.tsx";

const water: Habit = {
  id: "1",
  name: "Drink water",
  createdAt: "2026-10-05T09:00:00",
  color: "emerald",
  checkIns: ["2026-10-06", "2026-10-07"],
};

describe("StatsPage", () => {
  it("explains itself with no habits", () => {
    render(<StatsPage habits={[]} today="2026-10-07" />);
    expect(screen.getByText(/No stats yet/)).toBeInTheDocument();
  });

  it("shows overall and per-habit stats for one habit", () => {
    render(<StatsPage habits={[water]} today="2026-10-07" />);
    expect(screen.getByRole("region", { name: "Overall" })).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Drink water" });
    expect(section).toHaveTextContent("Last 7 days");
    expect(section).toHaveTextContent("67%");
    expect(section).toHaveTextContent("Current streak 2");
  });

  it("lists every habit", () => {
    render(
      <StatsPage
        habits={[water, { ...water, id: "2", name: "Read 10 pages" }]}
        today="2026-10-07"
      />,
    );
    expect(screen.getByRole("region", { name: "Read 10 pages" })).toBeInTheDocument();
  });
});
