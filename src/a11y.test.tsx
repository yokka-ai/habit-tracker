import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App.tsx";
import { axeViolations } from "./test/axe.ts";

function addHabit(name: string, category?: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
    target: { value: name },
  });
  if (category) {
    fireEvent.change(screen.getByRole("combobox", { name: /category/i }), {
      target: { value: category },
    });
  }
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
}

describe("accessibility", () => {
  it("has no axe violations on the empty screen", async () => {
    render(<App />);
    expect(await axeViolations()).toEqual([]);
  });

  it("has no axe violations with habits, checked off and in edit mode", async () => {
    render(<App />);
    addHabit("Drink water");
    addHabit("Read 10 pages");
    fireEvent.click(screen.getByRole("button", { name: "Done today: Drink water" }));
    expect(await axeViolations()).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Edit Read 10 pages" }));
    expect(await axeViolations()).toEqual([]);
  });

  it("has no axe violations with the shortcuts dialog open", async () => {
    render(<App />);
    fireEvent.keyDown(document.body, { key: "?" });
    expect(await axeViolations()).toEqual([]);
  });

  it("announces check-offs in a polite live region", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Done today: Drink water" }));
    expect(screen.getByRole("status")).toHaveTextContent("Drink water checked off for today");
    fireEvent.click(screen.getByRole("button", { name: "Done today: Drink water" }));
    expect(screen.getByRole("status")).toHaveTextContent("Drink water unchecked for today");
  });
});
