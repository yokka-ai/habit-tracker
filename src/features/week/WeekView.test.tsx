import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Habit } from "../../lib/habit.ts";
import { WeekView } from "./WeekView.tsx";

const habit: Habit = {
  id: "h1",
  name: "Drink water",
  checkIns: ["2026-10-05"],
} as Habit;

afterEach(cleanup);

describe("WeekView", () => {
  it("shows the week starting on Monday", () => {
    render(<WeekView habits={[habit]} today="2026-10-07" onToggleDay={() => {}} />);
    expect(screen.getByText("5 October to 11 October")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Drink water, / })).toHaveLength(7);
  });

  it("shows existing check-ins as pressed", () => {
    render(<WeekView habits={[habit]} today="2026-10-07" onToggleDay={() => {}} />);
    expect(screen.getByRole("button", { name: "Drink water, 5 October" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Drink water, 6 October" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("toggles past days and today but disables future days", () => {
    const onToggleDay = vi.fn();
    render(<WeekView habits={[habit]} today="2026-10-07" onToggleDay={onToggleDay} />);
    fireEvent.click(screen.getByRole("button", { name: "Drink water, 6 October" }));
    expect(onToggleDay).toHaveBeenCalledWith("h1", "2026-10-06");
    fireEvent.click(screen.getByRole("button", { name: "Drink water, 7 October" }));
    expect(onToggleDay).toHaveBeenCalledWith("h1", "2026-10-07");
    const future = screen.getByRole("button", { name: "Drink water, 8 October" });
    expect(future).toBeDisabled();
    fireEvent.click(future);
    expect(onToggleDay).toHaveBeenCalledTimes(2);
  });

  it("moves between weeks", () => {
    render(<WeekView habits={[habit]} today="2026-10-07" onToggleDay={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }));
    expect(screen.getByText("28 September to 4 October")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drink water, 4 October" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(screen.getByText("12 October to 18 October")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drink water, 12 October" })).toBeDisabled();
  });
});
