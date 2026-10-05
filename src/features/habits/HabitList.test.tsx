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
