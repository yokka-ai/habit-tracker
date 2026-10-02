import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddHabitForm } from "./AddHabitForm.tsx";

describe("AddHabitForm", () => {
  it("adds a trimmed name on submit and clears the field", () => {
    const onAdd = vi.fn();
    render(<AddHabitForm onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: "Habit name" });
    fireEvent.change(input, { target: { value: "  Drink water  " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("Drink water", undefined);
    expect(input).toHaveValue("");
  });

  it("refuses an empty name with a message", () => {
    const onAdd = vi.fn();
    render(<AddHabitForm onAdd={onAdd} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a habit name.");
  });

  it("passes a trimmed category along and clears it", () => {
    const onAdd = vi.fn();
    render(<AddHabitForm onAdd={onAdd} />);
    const category = screen.getByRole("combobox", { name: "Category (optional)" });
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Drink water" },
    });
    fireEvent.change(category, { target: { value: " Health " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("Drink water", "Health");
    expect(category).toHaveValue("");
  });
});
