import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("shows the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Habit Tracker" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no habits", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});

describe("adding habits", () => {
  it("shows an added habit and hides the empty state", () => {
    render(<App />);
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: "Read 10 pages" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Read 10 pages");
    expect(
      screen.queryByRole("heading", { name: "Start your first habit" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the empty state when the name is blank", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});

describe("starter habits", () => {
  it("adds a habit when a suggestion is clicked and hides the empty state", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Walk 20 minutes" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Walk 20 minutes");
    expect(screen.queryByRole("list", { name: "Starter habits" })).not.toBeInTheDocument();
  });
});

describe("theme toggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("cycles System, Light and Dark, applies the dark class and remembers the choice", () => {
    const { unmount } = render(<App />);
    const toggle = () => screen.getByRole("button", { name: /^Theme: / });
    expect(toggle()).toHaveAccessibleName("Theme: System. Switch theme");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAccessibleName("Theme: Light. Switch theme");
    expect(document.documentElement).not.toHaveClass("dark");
    fireEvent.click(toggle());
    expect(toggle()).toHaveAccessibleName("Theme: Dark. Switch theme");
    expect(document.documentElement).toHaveClass("dark");

    unmount();
    render(<App />);
    expect(toggle()).toHaveAccessibleName("Theme: Dark. Switch theme");
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("editing and deleting habits", () => {
  function addHabit(name: string) {
    fireEvent.change(screen.getByRole("textbox", { name: "Habit name" }), {
      target: { value: name },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
  }

  it("renames a habit with Enter", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: "  Drink more water " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink more water");
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("refuses an empty rename", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: " " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a habit name.");
  });

  it("cancels a rename with Escape", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Edit Drink water" }));
    const input = screen.getByRole("textbox", { name: "Rename habit" });
    fireEvent.change(input, { target: { value: "Nope" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });

  it("asks before deleting and can be cancelled", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Delete Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep" }));
    expect(screen.getByRole("list", { name: "Habits" })).toHaveTextContent("Drink water");
  });

  it("deletes a habit once confirmed and shows the empty state", () => {
    render(<App />);
    addHabit("Drink water");
    fireEvent.click(screen.getByRole("button", { name: "Delete Drink water" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete Drink water" }));
    expect(screen.queryByRole("list", { name: "Habits" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start your first habit" })).toBeInTheDocument();
  });
});
