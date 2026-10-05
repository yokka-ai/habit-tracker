import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createHabit, type Habit } from "../../lib/habit.ts";
import { HabitList } from "./HabitList.tsx";

const [water, read, stretch] = ["Drink water", "Read 10 pages", "Stretch"].map((name) =>
  createHabit(name),
) as [Habit, Habit, Habit];
const habits = [water, read, stretch];

function setup() {
  const onMove = vi.fn();
  render(
    <HabitList
      habits={habits}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onArchive={vi.fn()}
      onMove={onMove}
      onToggle={vi.fn()}
      today="2026-10-05"
    />,
  );
  return onMove;
}

describe("HabitList reordering", () => {
  it("moves a habit up and down with buttons", () => {
    const onMove = setup();
    fireEvent.click(screen.getByRole("button", { name: "Move up Read 10 pages" }));
    expect(onMove).toHaveBeenLastCalledWith(read.id, water.id);
    fireEvent.click(screen.getByRole("button", { name: "Move down Read 10 pages" }));
    expect(onMove).toHaveBeenLastCalledWith(read.id, stretch.id);
  });

  it("disables Move up on the first and Move down on the last habit", () => {
    setup();
    expect(screen.getByRole("button", { name: "Move up Drink water" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move down Stretch" })).toBeDisabled();
  });

  it("reorders by dragging a handle onto another row", () => {
    const onMove = setup();
    const handle = document.querySelector('[data-drag-handle="Stretch"]') as HTMLElement;
    const target = screen.getAllByRole("listitem")[0] as HTMLElement;
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(onMove).toHaveBeenCalledWith(stretch.id, water.id);
  });
});

describe("HabitList check-off", () => {
  it("shows a pressed toggle for habits done today and reports clicks", () => {
    const onToggle = vi.fn();
    const done = { ...water, checkIns: ["2026-10-05"] };
    render(
      <HabitList
        habits={[done, read]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onArchive={vi.fn()}
        onMove={vi.fn()}
        onToggle={onToggle}
        today="2026-10-05"
      />,
    );
    expect(screen.getByRole("button", { name: "Done today: Drink water" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const open = screen.getByRole("button", { name: "Done today: Read 10 pages" });
    expect(open).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(open);
    expect(onToggle).toHaveBeenCalledWith(read.id);
  });
});
