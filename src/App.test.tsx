import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("shows the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Habit Tracker" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no habits", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "No habits yet" })).toBeInTheDocument();
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
    expect(screen.queryByRole("heading", { name: "No habits yet" })).not.toBeInTheDocument();
  });

  it("keeps the empty state when the name is blank", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No habits yet" })).toBeInTheDocument();
  });
});
