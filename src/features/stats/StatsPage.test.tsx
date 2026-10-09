import { fireEvent, render, screen } from "@testing-library/react";
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

  describe("archived habits", () => {
    const paused: Habit = {
      ...water,
      id: "2",
      name: "Read 10 pages",
      checkIns: [],
      archived: true,
    };

    it("leaves archived habits out of the overall numbers by default", () => {
      render(<StatsPage habits={[water, paused]} today="2026-10-07" />);
      expect(screen.getByRole("region", { name: "Overall" })).toHaveTextContent("67%");
    });

    it("counts archived habits in the overall numbers when asked", () => {
      render(<StatsPage habits={[water, paused]} today="2026-10-07" />);
      fireEvent.click(screen.getByRole("checkbox", { name: "Include archived habits" }));
      expect(screen.getByRole("region", { name: "Overall" })).toHaveTextContent("33%");
    });

    it("marks archived habits in the per-habit list", () => {
      render(<StatsPage habits={[water, paused]} today="2026-10-07" />);
      expect(screen.getByRole("region", { name: "Read 10 pages" })).toHaveTextContent("Archived");
      expect(screen.getByRole("region", { name: "Drink water" })).not.toHaveTextContent("Archived");
    });
  });
});
